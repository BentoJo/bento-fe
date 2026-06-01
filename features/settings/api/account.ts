import { getClientAxios } from "@/shared/lib/api/client";
import { getErrorMessage } from "@/shared/types/api/errors";
import type { ApiEnvelope } from "@/shared/types/api/response";

/**
 * Account / auth API helpers used by the settings feature.
 *
 * Only logout-all is available on the gateway today. Device + session LIST
 * lives in IAM and is NOT exposed on the gateway.
 * TODO(BE): expose sessions/devices list endpoints on the gateway.
 */
const BASE = "/v1/auth";

/**
 * Revokes every active session/device for the current user.
 * POST /v1/auth/logout-all — gateway wraps responses as { success, message, data }.
 */
export async function logoutAllDevices(): Promise<void> {
  try {
    await getClientAxios().post<ApiEnvelope<unknown>>(`${BASE}/logout-all`);
  } catch (error) {
    throw new Error(
      getErrorMessage(error) || "Failed to log out of all devices.",
    );
  }
}
