/**
 * Client context headers that are sent with every API request
 * These are extracted by the API Gateway middleware to identify and track client details
 */

export interface ClientContextHeaders {
  // Device identification
  "x-device-fingerprint": string;
  "x-device-name": string;
  "x-device-type": string;
  "x-device-platform": string | null;
  "x-device-token": string | null;

  // Device capabilities
  "x-device-hardware-concurrency": number | null;
  "x-device-timezone": string | null;
  "x-device-language": string | null;

  // Client information
  "x-platform": string;
  "x-client-version": string;
  "x-timezone": string;
  "x-request-id": string;
  "x-session-id": string | null;
}

export interface DeviceInfo {
  fingerprint: string;
  name: string;
  type: "mobile" | "tablet" | "desktop";
  platform: string | null;
  hardwareConcurrency: number | null;
  timezone: string | null;
  language: string | null;
  token: string | null;
}

export interface ClientContext {
  deviceInfo: DeviceInfo;
  platform: string;
  clientVersion: string;
  timezone: string;
  requestId: string;
  sessionId: string | null;
}
