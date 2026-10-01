/**
 * Core BLE Radio Service
 *
 * Implements:
 * - Real BLE Central scanning via react-native-ble-plx
 * - Duplicate device elimination & RSSI updates
 * - Throttled / batched UI updates (500-1000ms) to prevent JS thread freezing
 * - Stale peer expiration based on TTL
 * - Safe GATT connection & service discovery (discoverAllServicesAndCharacteristics)
 * - Safe asynchronous connection cancellation in destroy()
 * - Clean listener lifecycle management
 */

import {BleManager, Device, State, Subscription} from 'react-native-ble-plx';
import {
  BlePeer,
  BleRadioState,
  RESQ_MESH_SERVICE_UUID,
} from './types';
import {PeerIdentityService} from './peerIdentity';
import {BlePermissions} from './blePermissions';

const SCAN_TIMEOUT_MS = 20000; // 20 seconds automatic scan timeout
const BATCH_INTERVAL_MS = 600; // Batch UI updates to ~1.6 Hz
const PEER_EXPIRATION_TTL_MS = 60000; // 60s TTL for inactive, disconnected peers

function extractPeerIdFromManufacturerData(
  manufacturerData: string | null | undefined
): string | null {
  if (!manufacturerData) {
    return null;
  }
  try {
    const raw = typeof atob === 'function' ? atob(manufacturerData) : '';
    // Expected format: 2-byte manufacturer ID (0x08, 0xFD) followed by UTF-8 string (e.g. "RESQ-MESH:7F3A")
    if (raw.length > 2) {
      const payloadStr = raw.substring(2);
      if (
        payloadStr.startsWith('RESQ-MESH:') ||
        payloadStr.startsWith('RESQ_MESH:')
      ) {
        return payloadStr;
      }
    }
  } catch {}
  return null;
}

export class BleServiceManager {
  private manager: BleManager | null = null;
  private stateSubscription: Subscription | null = null;
  private scanTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private batchUpdateTimer: ReturnType<typeof setTimeout> | null = null;
  private hasPendingBatchUpdate = false;

  private isScanningActive = false;
  private discoveredPeersMap = new Map<string, BlePeer>();
  private activeConnections = new Map<string, Device>();

  private onPeersUpdatedCallback: ((peers: BlePeer[]) => void) | null = null;
  private onRadioStateChangedCallback: ((state: BleRadioState) => void) | null = null;
  private onScanStatusChangedCallback: ((isScanning: boolean) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  /**
   * Initializes the BleManager singleton and begins radio state observation.
   */
  public initialize(
    onRadioStateChange?: (state: BleRadioState) => void
  ): void {
    if (this.manager) {
      if (onRadioStateChange) {
        this.onRadioStateChangedCallback = onRadioStateChange;
      }
      return;
    }

    try {
      this.manager = new BleManager();
      this.onRadioStateChangedCallback = onRadioStateChange || null;

      this.stateSubscription = this.manager.onStateChange(state => {
        const mapped = this.mapRadioState(state);
        if (this.onRadioStateChangedCallback) {
          this.onRadioStateChangedCallback(mapped);
        }
        if (mapped === 'POWERED_OFF' && this.isScanningActive) {
          this.stopScanning();
          if (this.onErrorCallback) {
            this.onErrorCallback('Bluetooth radio was turned off. Scan stopped.');
          }
        }
      }, true);
    } catch (e: any) {
      if (this.onErrorCallback) {
        this.onErrorCallback(`Failed to initialize BLE radio: ${e?.message || e}`);
      }
    }
  }

  /**
   * Maps react-native-ble-plx State to our BleRadioState enum.
   */
  private mapRadioState(state: State): BleRadioState {
    switch (state) {
      case State.PoweredOn:
        return 'POWERED_ON';
      case State.PoweredOff:
        return 'POWERED_OFF';
      case State.Unauthorized:
        return 'UNAUTHORIZED';
      case State.Unsupported:
        return 'UNSUPPORTED';
      case State.Resetting:
        return 'RESETTING';
      case State.Unknown:
      default:
        return 'UNKNOWN';
    }
  }

  /**
   * Reads current radio state from the BLE controller.
   */
  public async getRadioState(): Promise<BleRadioState> {
    if (!this.manager) {
      this.initialize();
    }
    try {
      const state = await this.manager!.state();
      return this.mapRadioState(state);
    } catch {
      return 'UNKNOWN';
    }
  }

  /**
   * Sets callback listeners for UI subscription.
   */
  public setListeners(listeners: {
    onPeersUpdated?: (peers: BlePeer[]) => void;
    onRadioStateChanged?: (state: BleRadioState) => void;
    onScanStatusChanged?: (isScanning: boolean) => void;
    onError?: (error: string) => void;
  }): void {
    if (listeners.onPeersUpdated !== undefined) {
      this.onPeersUpdatedCallback = listeners.onPeersUpdated || null;
    }
    if (listeners.onRadioStateChanged !== undefined) {
      this.onRadioStateChangedCallback = listeners.onRadioStateChanged || null;
    }
    if (listeners.onScanStatusChanged !== undefined) {
      this.onScanStatusChangedCallback = listeners.onScanStatusChanged || null;
    }
    if (listeners.onError !== undefined) {
      this.onErrorCallback = listeners.onError || null;
    }
  }

  /**
   * Removes all registered callbacks to prevent screen listener retention.
   */
  public clearListeners(): void {
    this.onPeersUpdatedCallback = null;
    this.onRadioStateChangedCallback = null;
    this.onScanStatusChangedCallback = null;
    this.onErrorCallback = null;
  }

  /**
   * Starts real hardware BLE scanning for nearby devices.
   */
  public async startScanning(): Promise<void> {
    if (!this.manager) {
      this.initialize();
    }

    // 1. Verify runtime permissions
    const permResult = await BlePermissions.checkPermissions();
    if (!permResult.canScan) {
      const reqResult = await BlePermissions.requestPermissions();
      if (!reqResult.canScan) {
        if (this.onErrorCallback) {
          this.onErrorCallback(reqResult.message);
        }
        return;
      }
    }

    // 2. Verify Bluetooth hardware state
    const radioState = await this.getRadioState();
    if (radioState === 'POWERED_OFF') {
      if (this.onErrorCallback) {
        this.onErrorCallback(
          'Bluetooth is turned off. Please enable Bluetooth in your device settings.'
        );
      }
      return;
    }
    if (radioState === 'UNSUPPORTED') {
      if (this.onErrorCallback) {
        this.onErrorCallback(
          'Bluetooth Low Energy (BLE) is not supported on this device.'
        );
      }
      return;
    }

    // 3. Stop any existing scan
    if (this.isScanningActive) {
      this.stopScanning();
    }

    this.isScanningActive = true;
    if (this.onScanStatusChangedCallback) {
      this.onScanStatusChangedCallback(true);
    }

    // Start auto-timeout
    if (this.scanTimeoutTimer) {
      clearTimeout(this.scanTimeoutTimer);
    }
    this.scanTimeoutTimer = setTimeout(() => {
      this.stopScanning();
    }, SCAN_TIMEOUT_MS);

    try {
      this.manager!.startDeviceScan(
        null,
        {allowDuplicates: false},
        (error, device) => {
          if (error) {
            this.isScanningActive = false;
            if (this.onScanStatusChangedCallback) {
              this.onScanStatusChangedCallback(false);
            }
            if (this.onErrorCallback) {
              this.onErrorCallback(`BLE Scan error: ${error.message}`);
            }
            return;
          }

          if (device) {
            this.handleDiscoveredDevice(device);
          }
        }
      );
    } catch (e: any) {
      this.isScanningActive = false;
      if (this.onScanStatusChangedCallback) {
        this.onScanStatusChangedCallback(false);
      }
      if (this.onErrorCallback) {
        this.onErrorCallback(`Unable to start BLE scan: ${e?.message || e}`);
      }
    }
  }

  /**
   * Processes a discovered device, deduplicating and updating signal / identity.
   */
  private handleDiscoveredDevice(device: Device): void {
    const rawName = device.name || device.localName || '';
    const mfgPeerId = extractPeerIdFromManufacturerData(device.manufacturerData);

    const hasResqService =
      device.serviceUUIDs &&
      device.serviceUUIDs.some(
        uuid => uuid.toLowerCase() === RESQ_MESH_SERVICE_UUID.toLowerCase()
      );

    const isResq =
      Boolean(mfgPeerId) ||
      PeerIdentityService.isResqMeshName(rawName) ||
      Boolean(hasResqService);

    const displayName = mfgPeerId
      ? mfgPeerId
      : rawName
      ? rawName
      : isResq
      ? `RESQ-MESH:${device.id.slice(-4).toUpperCase()}`
      : `BLE Node [${device.id.slice(-5)}]`;

    const existing = this.discoveredPeersMap.get(device.id);

    const updatedPeer: BlePeer = {
      id: device.id,
      peerId: isResq ? displayName : device.id,
      name: displayName,
      rssi: device.rssi !== null ? device.rssi : (existing?.rssi ?? null),
      serviceUUIDs: device.serviceUUIDs ?? existing?.serviceUUIDs ?? null,
      connectionState: existing?.connectionState ?? 'discovered',
      lastSeen: Date.now(),
      isResqMeshPeer: isResq,
    };

    this.discoveredPeersMap.set(device.id, updatedPeer);
    this.schedulePeersBroadcast(false);
  }

  /**
   * Schedules a batched UI broadcast to avoid flooding the React Native thread.
   */
  private schedulePeersBroadcast(immediate = false): void {
    if (immediate) {
      if (this.batchUpdateTimer) {
        clearTimeout(this.batchUpdateTimer);
        this.batchUpdateTimer = null;
      }
      this.hasPendingBatchUpdate = false;
      this.broadcastPeersList();
      return;
    }

    this.hasPendingBatchUpdate = true;
    if (!this.batchUpdateTimer) {
      this.batchUpdateTimer = setTimeout(() => {
        this.batchUpdateTimer = null;
        if (this.hasPendingBatchUpdate) {
          this.hasPendingBatchUpdate = false;
          this.broadcastPeersList();
        }
      }, BATCH_INTERVAL_MS);
    }
  }

  /**
   * Prunes disconnected peers that have not been seen within PEER_EXPIRATION_TTL_MS.
   */
  private pruneStalePeers(): void {
    const now = Date.now();
    for (const [id, peer] of this.discoveredPeersMap.entries()) {
      if (
        peer.connectionState !== 'connected' &&
        peer.connectionState !== 'connecting' &&
        now - peer.lastSeen > PEER_EXPIRATION_TTL_MS
      ) {
        this.discoveredPeersMap.delete(id);
      }
    }
  }

  /**
   * Sorts and broadcasts the updated peer list to UI listeners.
   */
  private broadcastPeersList(): void {
    if (!this.onPeersUpdatedCallback) {
      return;
    }

    this.pruneStalePeers();

    const list = Array.from(this.discoveredPeersMap.values()).sort((a, b) => {
      // Prioritize recognized RESQ-MESH peers first
      if (a.isResqMeshPeer && !b.isResqMeshPeer) {
        return -1;
      }
      if (!a.isResqMeshPeer && b.isResqMeshPeer) {
        return 1;
      }
      // Then prioritize by strongest RSSI
      const rssiA = a.rssi ?? -999;
      const rssiB = b.rssi ?? -999;
      return rssiB - rssiA;
    });

    this.onPeersUpdatedCallback(list);
  }

  /**
   * Stops real hardware BLE scanning.
   */
  public stopScanning(): void {
    if (this.scanTimeoutTimer) {
      clearTimeout(this.scanTimeoutTimer);
      this.scanTimeoutTimer = null;
    }

    if (this.manager && this.isScanningActive) {
      try {
        this.manager.stopDeviceScan();
      } catch {}
    }

    this.isScanningActive = false;
    if (this.onScanStatusChangedCallback) {
      this.onScanStatusChangedCallback(false);
    }

    // Flush any pending batched updates immediately on stop
    this.schedulePeersBroadcast(true);
  }

  /**
   * Connects to a discovered BLE peer and discovers all GATT services & characteristics.
   */
  public async connectToPeer(deviceId: string): Promise<boolean> {
    if (!this.manager) {
      return false;
    }

    // Stop scanning during connection attempt to conserve radio resources
    if (this.isScanningActive) {
      this.stopScanning();
    }

    const peer = this.discoveredPeersMap.get(deviceId);
    if (peer) {
      peer.connectionState = 'connecting';
      this.schedulePeersBroadcast(true);
    }

    try {
      const connectedDevice = await this.manager.connectToDevice(deviceId, {
        autoConnect: false,
        timeout: 10000,
      });

      // Discover all services and characteristics before marking link active
      await connectedDevice.discoverAllServicesAndCharacteristics();

      this.activeConnections.set(deviceId, connectedDevice);

      if (peer) {
        peer.connectionState = 'connected';
        this.schedulePeersBroadcast(true);
      }

      // Register disconnect listener
      connectedDevice.onDisconnected((_error, _device) => {
        this.activeConnections.delete(deviceId);
        const p = this.discoveredPeersMap.get(deviceId);
        if (p) {
          p.connectionState = 'disconnected';
          this.schedulePeersBroadcast(true);
        }
      });

      return true;
    } catch (e: any) {
      try {
        await this.manager.cancelDeviceConnection(deviceId);
      } catch {}
      this.activeConnections.delete(deviceId);

      if (peer) {
        peer.connectionState = 'disconnected';
        this.schedulePeersBroadcast(true);
      }
      if (this.onErrorCallback) {
        this.onErrorCallback(`Connection failed: ${e?.message || e}`);
      }
      return false;
    }
  }

  /**
   * Disconnects from a currently connected BLE peer.
   */
  public async disconnectFromPeer(deviceId: string): Promise<void> {
    const peer = this.discoveredPeersMap.get(deviceId);
    const connection = this.activeConnections.get(deviceId);

    if (connection) {
      try {
        await connection.cancelConnection();
      } catch {}
      this.activeConnections.delete(deviceId);
    }

    if (peer) {
      peer.connectionState = 'disconnected';
      this.schedulePeersBroadcast(true);
    }
  }

  /**
   * Clears the current discovered peer cache.
   */
  public clearDiscoveredPeers(): void {
    this.discoveredPeersMap.clear();
    this.schedulePeersBroadcast(true);
  }

  /**
   * Full cleanup on service destruction.
   */
  public async destroy(): Promise<void> {
    this.stopScanning();
    if (this.stateSubscription) {
      this.stateSubscription.remove();
      this.stateSubscription = null;
    }

    if (this.batchUpdateTimer) {
      clearTimeout(this.batchUpdateTimer);
      this.batchUpdateTimer = null;
    }
    this.hasPendingBatchUpdate = false;

    // Safely await cancellation of all active connections before destroying manager
    const connections = Array.from(this.activeConnections.values());
    this.activeConnections.clear();

    await Promise.all(
      connections.map(async dev => {
        try {
          await dev.cancelConnection();
        } catch {}
      })
    );

    if (this.manager) {
      try {
        this.manager.destroy();
      } catch {}
      this.manager = null;
    }

    this.clearListeners();
  }
}

export const bleService = new BleServiceManager();
