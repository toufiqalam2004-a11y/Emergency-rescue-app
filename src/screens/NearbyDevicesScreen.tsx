import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {THEME} from '../config/theme';
import {AppHeader, EmergencyButton} from '../components';
import {NavigationProp} from '../navigation/types';
import {
  bleService,
  BlePermissions,
  BlePeer,
  BleRadioState,
  BlePermissionStatus,
} from '../services/ble';

interface NearbyDevicesScreenProps {
  navigation: NavigationProp;
}

export const NearbyDevicesScreen: React.FC<NearbyDevicesScreenProps> = ({
  navigation,
}) => {
  const [_radioState, setRadioState] = useState<BleRadioState>('UNKNOWN');
  const [permissionStatus, setPermissionStatus] = useState<BlePermissionStatus>('CHECKING');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [discoveredPeers, setDiscoveredPeers] = useState<BlePeer[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function setupBle() {
      const permResult = await BlePermissions.checkPermissions();
      if (isMounted) {
        setPermissionStatus(permResult.status);
      }

      bleService.initialize((state: BleRadioState) => {
        if (isMounted) {
          setRadioState(state);
        }
      });

      const initialRadio = await bleService.getRadioState();
      if (isMounted) {
        setRadioState(initialRadio);
      }

      bleService.setListeners({
        onPeersUpdated: (peers: BlePeer[]) => {
          if (isMounted) {
            setDiscoveredPeers(peers);
          }
        },
        onScanStatusChanged: (scanning: boolean) => {
          if (isMounted) {
            setIsScanning(scanning);
          }
        },
        onError: (err: string) => {
          if (isMounted) {
            setErrorMessage(err);
          }
        },
      });
    }

    setupBle();

    return () => {
      isMounted = false;
      bleService.stopScanning();
      bleService.clearListeners();
    };
  }, []);

  const handleStartScan = async () => {
    setErrorMessage(null);

    if (permissionStatus !== 'GRANTED') {
      const result = await BlePermissions.requestPermissions();
      setPermissionStatus(result.status);
      if (!result.canScan) {
        setErrorMessage('Please allow Bluetooth permissions to search for nearby help.');
        return;
      }
    }

    const currentRadio = await bleService.getRadioState();
    setRadioState(currentRadio);
    if (currentRadio === 'POWERED_OFF') {
      setErrorMessage('Bluetooth is turned off. Please turn on Bluetooth in your phone settings.');
      return;
    }

    await bleService.startScanning();
  };

  const handleStopScan = () => {
    bleService.stopScanning();
  };

  const handleConnect = useCallback(async (peerId: string) => {
    setErrorMessage(null);
    await bleService.connectToPeer(peerId);
  }, []);

  const handleDisconnect = useCallback(async (peerId: string) => {
    await bleService.disconnectFromPeer(peerId);
  }, []);

  const peerCount = discoveredPeers.length;

  return (
    <View style={styles.container}>
      <AppHeader
        title="Nearby Help"
        subtitle="Emergency Devices In Range"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Error Notice */}
        {errorMessage ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>⚠️ Notice</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <TouchableOpacity
              onPress={() => setErrorMessage(null)}
              style={styles.errorDismissBtn}>
              <Text style={styles.errorDismissText}>DISMISS</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Big Summary Status Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            {isScanning
              ? 'Searching for Nearby Devices...'
              : peerCount === 0
              ? 'No Nearby Devices Found Yet'
              : `${peerCount} Nearby ${peerCount === 1 ? 'Device' : 'Devices'}`}
          </Text>
          <Text style={styles.summarySubtitle}>
            {isScanning
              ? 'Looking for other emergency phones close to you'
              : peerCount === 0
              ? 'Tap the button below to search for help'
              : 'You can connect with these phones without internet'}
          </Text>
        </View>

        {/* Big Search Control Button */}
        <View style={styles.buttonWrapper}>
          {isScanning ? (
            <EmergencyButton
              title="⏹ STOP SEARCHING"
              subtitle="Stop looking for nearby devices"
              variant="warning"
              onPress={handleStopScan}
            />
          ) : (
            <EmergencyButton
              title="🔍 SEARCH FOR NEARBY HELP"
              subtitle="Tap to look for other phones close by"
              variant="primary"
              onPress={handleStartScan}
            />
          )}
        </View>

        {/* Scanning Indicator */}
        {isScanning ? (
          <View style={styles.searchingRow}>
            <ActivityIndicator size="large" color={THEME.colors.signal} />
            <Text style={styles.searchingText}>Searching nearby...</Text>
          </View>
        ) : null}

        {/* Simple Device List */}
        <View style={styles.deviceListContainer}>
          <Text style={styles.listHeader}>Nearby Devices List:</Text>

          {peerCount === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📱</Text>
              <Text style={styles.emptyTitle}>None found right now</Text>
              <Text style={styles.emptyDesc}>
                Make sure Bluetooth is turned on. When another phone running this app is within range, it will appear here.
              </Text>
            </View>
          ) : (
            discoveredPeers.map(peer => {
              const isConnected = peer.connectionState === 'connected';
              return (
                <View key={peer.id} style={styles.deviceCard}>
                  <View style={styles.deviceInfoRow}>
                    <Text style={styles.deviceIcon}>📱</Text>
                    <View style={styles.deviceTextCol}>
                      <Text style={styles.deviceName}>
                        {peer.name || 'Nearby Emergency Device'}
                      </Text>
                      <View style={styles.statusRow}>
                        <View
                          style={[
                            styles.statusDot,
                            isConnected
                              ? styles.statusDotConnected
                              : styles.statusDotAvailable,
                          ]}
                        />
                        <Text
                          style={[
                            styles.statusLabel,
                            isConnected
                              ? styles.statusLabelConnected
                              : styles.statusLabelAvailable,
                          ]}>
                          {isConnected ? 'Connected' : 'Available'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    {isConnected ? (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleDisconnect(peer.id)}
                        style={styles.disconnectBtn}>
                        <Text style={styles.disconnectBtnText}>DISCONNECT</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleConnect(peer.id)}
                        style={styles.connectBtn}>
                        <Text style={styles.connectBtnText}>CONNECT</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xxl,
  },
  summaryCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 20,
    borderWidth: 2,
    borderColor: THEME.colors.surfaceBorder,
    alignItems: 'center',
    marginVertical: THEME.spacing.sm,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    textAlign: 'center',
  },
  summarySubtitle: {
    fontSize: 18,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  buttonWrapper: {
    marginVertical: 10,
  },
  searchingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    backgroundColor: THEME.colors.surfaceRaised,
    borderRadius: THEME.borderRadius.md,
    marginVertical: 8,
  },
  searchingText: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.signal,
    marginLeft: 12,
  },
  deviceListContainer: {
    marginTop: 16,
  },
  listHeader: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.surfaceBorder,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  emptyDesc: {
    fontSize: 18,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 26,
  },
  deviceCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 18,
    borderWidth: 2,
    borderColor: THEME.colors.surfaceBorder,
    marginBottom: 14,
  },
  deviceInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIcon: {
    fontSize: 36,
    marginRight: 14,
  },
  deviceTextCol: {
    flex: 1,
  },
  deviceName: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusDotConnected: {
    backgroundColor: THEME.colors.success,
  },
  statusDotAvailable: {
    backgroundColor: THEME.colors.signal,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusLabelConnected: {
    color: THEME.colors.success,
  },
  statusLabelAvailable: {
    color: THEME.colors.signal,
  },
  actionRow: {
    marginTop: 14,
  },
  connectBtn: {
    backgroundColor: THEME.colors.signal,
    borderRadius: THEME.borderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  connectBtnText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  disconnectBtn: {
    backgroundColor: THEME.colors.surfaceRaised,
    borderRadius: THEME.borderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.emergency,
    minHeight: 56,
  },
  disconnectBtnText: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.emergency,
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderColor: THEME.colors.emergencyBorder,
    borderWidth: 2,
    borderRadius: THEME.borderRadius.md,
    padding: 16,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.emergency,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 16,
    color: THEME.colors.textPrimary,
    lineHeight: 22,
  },
  errorDismissBtn: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.emergency,
  },
  errorDismissText: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.emergency,
  },
});
