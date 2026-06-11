import { getClientAxios } from "@/shared/lib/api/client";
import { getErrorMessage } from "@/shared/types/api/errors";
import type { ApiEnvelope } from "@/shared/types/api/response";
import type { UpdateUserRequest, UserInfo } from "@/shared/types/auth";

/**
 * Updates the current user's profile.
 * PUT /v1/user/me — gateway UserController.updateMe injects the userId from the
 * auth token and forwards the body to IAM. Responses are wrapped as
 * { success, message, data }.
 */
export async function updateProfile(data: UpdateUserRequest): Promise<UserInfo> {
  try {
    const res = await getClientAxios().put<ApiEnvelope<UserInfo>>(
      "/v1/user/me",
      data,
    );
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error) || "Failed to update profile.");
  }
}
