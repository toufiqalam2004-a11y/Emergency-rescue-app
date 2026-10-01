import {AppState, AppStateStatus, NativeModules, Platform} from 'react-native';
import {STROBE_TIMING, buildSosPattern} from './constants';
import {TorchServiceState, TorchStateListener} from './types';

const {ResqTorchModule} = NativeModules;

class CancellationToken {
  private _isCancelled = false;
  private _timer: ReturnType<typeof setTimeout> | null = null;
  private _rejectCancel: (() => void) | null = null;

  get isCancelled(): boolean {
    return this._isCancelled;
  }

  cancel(): void {
    if (this._isCancelled) {
      return;
    }
    this._isCancelled = true;
    if (this._timer !== null) {
      clearTimeout(this._timer);
      this._timer = null;
    }
    if (this._rejectCancel !== null) {
      this._rejectCancel();
      this._rejectCancel = null;
    }
  }

  sleep(ms: number): Promise<void> {
    if (this._isCancelled) {
      return Promise.reject(new Error('CANCELLED'));
    }
    return new Promise<void>((resolve, reject) => {
      this._rejectCancel = () => {
        reject(new Error('CANCELLED'));
      };
      this._timer = setTimeout(() => {
        this._timer = null;
        this._rejectCancel = null;
        resolve();
      }, ms);
    });
  }
}

export class TorchService {
  private static instance: TorchService;

  private state: TorchServiceState = {
    isAvailable: false,
    status: 'READY',
    mode: 'OFF',
    isTorchOn: false,
  };

  private listeners: Set<TorchStateListener> = new Set();
  private activeToken: CancellationToken | null = null;
  private isLoopRunning = false;
  private appStateSubscription: {remove: () => void} | null = null;
  private isInitialized = false;

  private constructor() {
    this.setupAppStateListener();
  }

  public static getInstance(): TorchService {
    if (!TorchService.instance) {
      TorchService.instance = new TorchService();
    }
    return TorchService.instance;
  }

  private setupAppStateListener(): void {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState !== 'active') {
          // If the app goes into the background or locks screen, stop torch immediately for safety
          if (this.state.mode !== 'OFF' || this.state.isTorchOn) {
            this.stop().catch(() => {});
          }
        }
      }
    );
    this.appStateSubscription = subscription;
  }

  /**
   * Initialize and query hardware availability.
   */
  public async init(): Promise<boolean> {
    if (this.isInitialized) {
      return this.state.isAvailable;
    }

    try {
      if (Platform.OS !== 'android' || !ResqTorchModule) {
        this.updateState({
          isAvailable: false,
          status: 'FLASHLIGHT_UNAVAILABLE',
          errorMessage:
            Platform.OS !== 'android'
              ? 'Torch hardware bridge is only available on Android'
              : 'Native ResqTorchModule bridge not linked',
        });
        this.isInitialized = true;
        return false;
      }

      const available = await ResqTorchModule.isTorchAvailable();
      this.updateState({
        isAvailable: !!available,
        status: available ? 'READY' : 'FLASHLIGHT_UNAVAILABLE',
        errorMessage: available ? undefined : 'No rear camera flash detected',
      });
      this.isInitialized = true;
      return !!available;
    } catch (err: any) {
      this.updateState({
        isAvailable: false,
        status: 'ERROR',
        errorMessage: err?.message || 'Error checking flashlight availability',
      });
      this.isInitialized = true;
      return false;
    }
  }

  public getState(): TorchServiceState {
    return {...this.state};
  }

  public subscribe(listener: TorchStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private updateState(partial: Partial<TorchServiceState>): void {
    this.state = {...this.state, ...partial};
    const currentState = this.getState();
    this.listeners.forEach(listener => {
      try {
        listener(currentState);
      } catch (e) {
        // Prevent listener failures from crashing the service
      }
    });
  }

  private async setHardwareTorch(enabled: boolean): Promise<void> {
    if (Platform.OS !== 'android' || !ResqTorchModule) {
      this.updateState({isTorchOn: false});
      return;
    }

    try {
      await ResqTorchModule.setTorchEnabled(enabled);
      this.updateState({isTorchOn: enabled});
    } catch (err: any) {
      this.updateState({
        isTorchOn: false,
        status: 'ERROR',
        errorMessage: err?.message || 'Camera torch hardware error',
      });
      throw err;
    }
  }

  /**
   * Start Morse Code SOS (... --- ...) loop.
   */
  public async startSos(): Promise<void> {
    if (this.state.mode === 'SOS' && this.isLoopRunning) {
      return; // Already actively running SOS - prevent duplicate loops
    }

    // Ensure initialized
    if (!this.isInitialized) {
      await this.init();
    }

    if (!this.state.isAvailable) {
      this.updateState({
        status: 'FLASHLIGHT_UNAVAILABLE',
        errorMessage: 'Flashlight hardware unavailable',
      });
      return;
    }

    // Cancel existing loop if running in another mode (e.g., STROBE)
    this.cancelActiveToken();

    const token = new CancellationToken();
    this.activeToken = token;
    this.updateState({
      mode: 'SOS',
      status: 'ACTIVE',
      errorMessage: undefined,
    });

    this.runSosLoop(token);
  }

  /**
   * Start Manual Strobe loop (fixed interval pulse).
   */
  public async startStrobe(): Promise<void> {
    if (this.state.mode === 'STROBE' && this.isLoopRunning) {
      return; // Already actively running Strobe - prevent duplicate loops
    }

    if (!this.isInitialized) {
      await this.init();
    }

    if (!this.state.isAvailable) {
      this.updateState({
        status: 'FLASHLIGHT_UNAVAILABLE',
        errorMessage: 'Flashlight hardware unavailable',
      });
      return;
    }

    this.cancelActiveToken();

    const token = new CancellationToken();
    this.activeToken = token;
    this.updateState({
      mode: 'STROBE',
      status: 'ACTIVE',
      errorMessage: undefined,
    });

    this.runStrobeLoop(token);
  }

  private cancelActiveToken(): void {
    if (this.activeToken) {
      this.activeToken.cancel();
      this.activeToken = null;
    }
  }

  private async runSosLoop(token: CancellationToken): Promise<void> {
    this.isLoopRunning = true;
    const pattern = buildSosPattern();

    try {
      while (!token.isCancelled) {
        for (const step of pattern) {
          if (token.isCancelled) {
            break;
          }
          await this.setHardwareTorch(step.torchOn);
          if (token.isCancelled) {
            break;
          }
          await token.sleep(step.durationMs);
        }
      }
    } catch (err: any) {
      if (err?.message !== 'CANCELLED') {
        this.updateState({
          status: 'ERROR',
          errorMessage: err?.message || 'SOS strobe interrupted by hardware error',
        });
      }
    } finally {
      this.isLoopRunning = false;
      await this.setHardwareTorch(false).catch(() => {});
      if (this.activeToken === token) {
        this.activeToken = null;
        if (this.state.status === 'ACTIVE') {
          this.updateState({
            mode: 'OFF',
            status: this.state.isAvailable ? 'READY' : 'FLASHLIGHT_UNAVAILABLE',
            isTorchOn: false,
          });
        }
      }
    }
  }

  private async runStrobeLoop(token: CancellationToken): Promise<void> {
    this.isLoopRunning = true;

    try {
      while (!token.isCancelled) {
        if (token.isCancelled) {
          break;
        }
        await this.setHardwareTorch(true);
        if (token.isCancelled) {
          break;
        }
        await token.sleep(STROBE_TIMING.ON_MS);

        if (token.isCancelled) {
          break;
        }
        await this.setHardwareTorch(false);
        if (token.isCancelled) {
          break;
        }
        await token.sleep(STROBE_TIMING.OFF_MS);
      }
    } catch (err: any) {
      if (err?.message !== 'CANCELLED') {
        this.updateState({
          status: 'ERROR',
          errorMessage: err?.message || 'Manual strobe interrupted by hardware error',
        });
      }
    } finally {
      this.isLoopRunning = false;
      await this.setHardwareTorch(false).catch(() => {});
      if (this.activeToken === token) {
        this.activeToken = null;
        if (this.state.status === 'ACTIVE') {
          this.updateState({
            mode: 'OFF',
            status: this.state.isAvailable ? 'READY' : 'FLASHLIGHT_UNAVAILABLE',
            isTorchOn: false,
          });
        }
      }
    }
  }

  /**
   * Immediately stops any running SOS or strobe loop and turns off torch.
   */
  public async stop(): Promise<void> {
    this.cancelActiveToken();
    this.isLoopRunning = false;

    try {
      await this.setHardwareTorch(false);
    } catch (ignored) {}

    this.updateState({
      mode: 'OFF',
      status: this.state.isAvailable ? 'READY' : 'FLASHLIGHT_UNAVAILABLE',
      isTorchOn: false,
    });
  }

  /**
   * Cleanup resources on teardown.
   */
  public destroy(): void {
    this.stop().catch(() => {});
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    this.listeners.clear();
  }
}

export const torchService = TorchService.getInstance();
