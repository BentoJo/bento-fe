/**
 * Session storage utilities
 * Session management is now handled via httpOnly cookies:
 * - sessionId: sent in httpOnly cookie "sessionId"
 * - deviceToken: sent in httpOnly cookie "deviceToken"
 *
 * This file is kept for backwards compatibility and device reference only.
 */

const DEVICE_ID_STORAGE_KEY = "bento_device_id";

/**
 * Store device ID for reference only (token is in httpOnly cookie)
 */
export function storeDeviceId(deviceId: string): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
    }
  } catch (e) {
    console.warn("Failed to store device ID:", e);
  }
}

/**
 * Get stored device ID (for reference only)
 * Note: device token is automatically sent via httpOnly cookie
 */
export function getStoredDeviceId(): string | null {
  try {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    }
  } catch (e) {
    console.warn("Failed to retrieve device ID:", e);
  }
  return null;
}

/**
 * Clear device data on logout
 */
export function clearSessionData(): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(DEVICE_ID_STORAGE_KEY);
    }
  } catch (e) {
    console.warn("Failed to clear session data:", e);
  }
}
