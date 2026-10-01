export type TorchMode = 'OFF' | 'SOS' | 'STROBE';

export type TorchStatus =
  | 'READY'
  | 'ACTIVE'
  | 'FLASHLIGHT_UNAVAILABLE'
  | 'ERROR';

export interface TorchServiceState {
  isAvailable: boolean;
  status: TorchStatus;
  mode: TorchMode;
  isTorchOn: boolean;
  errorMessage?: string;
}

export type TorchStateListener = (state: TorchServiceState) => void;

export interface SosStep {
  torchOn: boolean;
  durationMs: number;
  description: string;
}
