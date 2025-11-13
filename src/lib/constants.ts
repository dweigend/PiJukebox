/**
 * Application constants
 */

// RFID Card Configuration
export const CARD_ID_LENGTH = 10;
export const CARD_ID_PATTERN = /^\d{10}$/;
export const INPUT_RESET_TIMEOUT_MS = 2000;

// File Upload Configuration
export const UPLOAD_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const UPLOAD_MAX_SIZE_MB = 10;

// Folder Name Validation
export const FOLDER_NAME_PATTERN = /^[a-z0-9_-]+$/i;
