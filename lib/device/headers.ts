import { v4 as uuidv4 } from "uuid";
import type {
  ClientContextHeaders,
  DeviceInfo,
  ClientContext,
} from "@/types/api/client-context";
import { collectDeviceInfo } from "./device-info";

const CLIENT_VERSION = "1.0.0";

/**
 * Session ID is now managed via httpOnly cookies
 * No need to send it in headers - browser sends cookies automatically
 */

/**
 * Get the client's timezone
 */
export function getClientTimezone(): string {
  try {
    if (typeof Intl !== "undefined") {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
  } catch (e) {
    console.warn("Failed to get timezone:", e);
  }

  return "Asia/Amman"; // Fallback to server default
}

/**
 * Build all client context headers for API requests
 */
export function buildClientContextHeaders(): ClientContextHeaders {
  const deviceInfo = collectDeviceInfo();

  return {
    "x-device-fingerprint": deviceInfo.fingerprint,
    "x-device-name": deviceInfo.name,
    "x-device-type": deviceInfo.type,
    "x-device-platform": deviceInfo.platform,
    "x-device-token": deviceInfo.token,
    "x-device-hardware-concurrency": deviceInfo.hardwareConcurrency,
    "x-device-timezone": deviceInfo.timezone,
    "x-device-language": deviceInfo.language,
    "x-platform": "web",
    "x-client-version": CLIENT_VERSION,
    "x-timezone": getClientTimezone(),
    "x-request-id": uuidv4(),
    "x-session-id": null, // Session ID is now sent via httpOnly cookie
  };
}

/**
 * Build complete client context
 */
export function buildClientContext(): ClientContext {
  const deviceInfo = collectDeviceInfo();

  return {
    deviceInfo,
    platform: "web",
    clientVersion: CLIENT_VERSION,
    timezone: getClientTimezone(),
    requestId: uuidv4(),
    sessionId: null, // Session ID is now sent via httpOnly cookie
  };
}

/**
 * Convert header values to string format (for axios headers)
 */
export function getHeadersForRequest(): Record<string, string | null> {
  const headers = buildClientContextHeaders();

  return {
    "x-device-fingerprint": headers["x-device-fingerprint"],
    "x-device-name": headers["x-device-name"],
    "x-device-type": headers["x-device-type"],
    "x-device-platform": headers["x-device-platform"] || "",
    "x-device-token": headers["x-device-token"] || "",
    "x-device-hardware-concurrency":
      headers["x-device-hardware-concurrency"]?.toString() || "",
    "x-device-timezone": headers["x-device-timezone"] || "",
    "x-device-language": headers["x-device-language"] || "",
    "x-platform": headers["x-platform"],
    "x-client-version": headers["x-client-version"],
    "x-timezone": headers["x-timezone"],
    "x-request-id": headers["x-request-id"],
  };
}
