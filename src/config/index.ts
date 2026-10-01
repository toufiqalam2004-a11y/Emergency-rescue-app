/**
 * Global Application Configuration & Service Constants
 */
import {RESQ_MESH_SERVICE_UUID} from '../services/ble/types';

export {THEME} from './theme';
export {RESQ_MESH_SERVICE_UUID};

export const APP_CONFIG = {
  APP_NAME: 'RESQ-MESH (APP-08)',
  VERSION: '0.1.0',
  BLE_SERVICE_UUID: RESQ_MESH_SERVICE_UUID,
  MAX_TTL: 5,
  SCAN_INTERVAL_MS: 5000,
  SCAN_IDLE_MS: 55000,
};
