import { v4 as uuidv4 } from "uuid";
import type { DeviceInfo } from "@/types/api/client-context";

const DEVICE_FINGERPRINT_STORAGE_KEY =
  process.env.DEVICE_FINGERPRINT_STORAGE_KEY;
const DEVICE_NAME_STORAGE_KEY = process.env.DEVICE_NAME_STORAGE_KEY;

if (!DEVICE_FINGERPRINT_STORAGE_KEY || !DEVICE_NAME_STORAGE_KEY) {
  throw new Error(
    "Device storage keys are not defined in environment variables",
  );
}

export function getDeviceFingerprint(): string {
  try {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(DEVICE_FINGERPRINT_STORAGE_KEY!);
      if (stored) {
        return stored;
      }

      const fingerprint = generateFingerprint();
      localStorage.setItem(DEVICE_FINGERPRINT_STORAGE_KEY!, fingerprint);
      return fingerprint;
    }
  } catch (e) {
    console.warn("Failed to access localStorage for device fingerprint:", e);
  }

  return generateFingerprint();
}

function generateFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.textBaseline = "alphabetic";
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
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  } catch (e) {
    return uuidv4();
  }
}

export function getDeviceName(): string {
  try {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(DEVICE_NAME_STORAGE_KEY!);
      if (stored) {
        return stored;
      }

      const deviceName = generateDeviceName();
      localStorage.setItem(DEVICE_NAME_STORAGE_KEY!, deviceName);
      return deviceName;
    }
  } catch (e) {
    console.warn("Failed to access localStorage for device name:", e);
  }

  return generateDeviceName();
}

function generateDeviceName(): string {
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
  if (typeof window === "undefined") {
    return "desktop";
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile =
    /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /ipad|android(?!.*mobile)|xoom/i.test(userAgent);

  if (isMobile) return "mobile";
  if (isTablet) return "tablet";

  if (window.innerWidth <= 640) return "mobile";
  if (window.innerWidth <= 1024) return "tablet";

  return "desktop";
}

export function getDevicePlatform(): string | null {
  if (typeof window === "undefined") {
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
  if (typeof navigator === "undefined" || !navigator.hardwareConcurrency) {
    return null;
  }

  return navigator.hardwareConcurrency;
}

export function getTimezone(): string | null {
  try {
    if (typeof Intl === "undefined") {
      return null;
    }

    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    return null;
  }
}

export function getLanguage(): string | null {
  if (typeof navigator === "undefined") {
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
    token: null, // Device token is managed by backend and sent via httpOnly cookie
  };
}
