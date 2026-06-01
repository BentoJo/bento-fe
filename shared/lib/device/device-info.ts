import { v4 as uuidv4 } from "uuid";
import type { DeviceInfo } from "@/shared/types/api/client-context";

const DEVICE_FINGERPRINT_STORAGE_KEY =
  process.env.NEXT_PUBLIC_DEVICE_FINGERPRINT_STORAGE_KEY;

const DEVICE_NAME_STORAGE_KEY =
  process.env.NEXT_PUBLIC_DEVICE_NAME_STORAGE_KEY;

if (!DEVICE_FINGERPRINT_STORAGE_KEY) {
  console.log(DEVICE_FINGERPRINT_STORAGE_KEY);
  throw new Error(
    "NEXT_PUBLIC_DEVICE_FINGERPRINT_STORAGE_KEY is not defined"
  );
}

if (!DEVICE_NAME_STORAGE_KEY) {
  console.log(DEVICE_NAME_STORAGE_KEY);
  throw new Error("NEXT_PUBLIC_DEVICE_NAME_STORAGE_KEY is not defined");
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getDeviceFingerprintStorageKey(): string {
  return DEVICE_FINGERPRINT_STORAGE_KEY!;
}

function getDeviceNameStorageKey(): string {
  return DEVICE_NAME_STORAGE_KEY!;
}

export function getDeviceFingerprint(): string {
  try {
    if (isBrowser() && typeof localStorage !== "undefined") {
      const storageKey = getDeviceFingerprintStorageKey();

      const stored = localStorage.getItem(storageKey);

      if (stored) {
        return stored;
      }

      const fingerprint = generateFingerprint();

      localStorage.setItem(storageKey, fingerprint);

      return fingerprint;
    }
  } catch (error) {
    console.warn(
      "Failed to access localStorage for fingerprint:",
      error
    );
  }

  return generateFingerprint();
}

function generateFingerprint(): string {
  try {
    if (!isBrowser()) {
      return uuidv4();
    }

    const canvas = document.createElement("canvas");

    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";

      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);

      ctx.fillStyle = "#069";
      ctx.fillText("Browser Fingerprint", 2, 15);

      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("Browser Fingerprint", 4, 17);
    }

    const canvasFingerprint = canvas.toDataURL();

    const navigatorInfo = `${navigator.language}-${navigator.platform}-${navigator.hardwareConcurrency}`;

    let hash = 0;

    const str = canvasFingerprint + navigatorInfo;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);

      hash = (hash << 5) - hash + char;

      hash |= 0;
    }

    return Math.abs(hash).toString(16);
  } catch {
    return uuidv4();
  }
}

export function getDeviceName(): string {
  try {
    if (isBrowser() && typeof localStorage !== "undefined") {
      const storageKey = getDeviceNameStorageKey();

      const stored = localStorage.getItem(storageKey);

      if (stored) {
        return stored;
      }

      const deviceName = generateDeviceName();

      localStorage.setItem(storageKey, deviceName);

      return deviceName;
    }
  } catch (error) {
    console.warn(
      "Failed to access localStorage for device name:",
      error
    );
  }

  return generateDeviceName();
}

function generateDeviceName(): string {
  if (!isBrowser()) {
    return "Generic Device";
  }

  const browserNames: Record<string, string> = {
    Chrome: "Chrome Device",
    Firefox: "Firefox Device",
    Safari: "Safari Device",
    Edge: "Edge Device",
  };

  const userAgent = navigator.userAgent;

  for (const [browser, name] of Object.entries(browserNames)) {
    if (userAgent.includes(browser)) {
      return name;
    }
  }

  return "Generic Device";
}

export function getDeviceType(): "mobile" | "tablet" | "desktop" {
  if (!isBrowser()) {
    return "desktop";
  }

  const userAgent = navigator.userAgent.toLowerCase();

  const isMobile =
    /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent
    );

  const isTablet =
    /ipad|android(?!.*mobile)|xoom/i.test(userAgent);

  if (isMobile) return "mobile";

  if (isTablet) return "tablet";

  if (window.innerWidth <= 640) return "mobile";

  if (window.innerWidth <= 1024) return "tablet";

  return "desktop";
}

export function getDevicePlatform(): string | null {
  if (!isBrowser()) {
    return null;
  }

  const platforms: Record<string, string> = {
    Mac: "macOS",
    Win: "Windows",
    Linux: "Linux",
    iPhone: "iOS",
    iPad: "iOS",
    Android: "Android",
  };

  for (const [key, value] of Object.entries(platforms)) {
    if (navigator.userAgent.includes(key)) {
      return value;
    }
  }

  return null;
}

export function getHardwareConcurrency(): number | null {
  if (!isBrowser() || !navigator.hardwareConcurrency) {
    return null;
  }

  return navigator.hardwareConcurrency;
}

export function getTimezone(): string | null {
  try {
    if (typeof Intl === "undefined") {
      return null;
    }

    return Intl.DateTimeFormat()
      .resolvedOptions()
      .timeZone;
  } catch {
    return null;
  }
}

export function getLanguage(): string | null {
  if (!isBrowser()) {
    return null;
  }

  return navigator.language || null;
}

export function collectDeviceInfo(): DeviceInfo {
  return {
    fingerprint: getDeviceFingerprint(),
    name: getDeviceName(),
    type: getDeviceType(),
    platform: getDevicePlatform(),
    hardwareConcurrency: getHardwareConcurrency(),
    timezone: getTimezone(),
    language: getLanguage(),
    token: null,
  };
}