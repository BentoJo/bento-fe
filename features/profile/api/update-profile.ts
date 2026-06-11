import { getClientAxios } from "@/shared/lib/api/client";
import { getErrorMessage } from "@/shared/types/api/errors";
import type { ApiEnvelope } from "@/shared/types/api/response";
import type { UpdateUserRequest } from "@/shared/types/auth";

/** Full profile as returned by GET/PUT /v1/user/me (IAM UserInfo). */
export interface ProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  bio: string | null;
  phone: string | null;
  dob: string | null;
  gender: string | null;
  createdAt?: string | null;
}

/**
 * Loads the current user's full profile.
 * GET /v1/user/me — returns all stored fields (bio, phone, dob, gender, …),
 * which the auth session token does NOT carry. Fetch this on the profile page
 * so every field is populated and persists across refreshes.
 */
export async function getProfile(): Promise<ProfileData> {
  try {
    const res = await getClientAxios().get<ApiEnvelope<ProfileData>>(
      "/v1/user/me",
    );
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error) || "Failed to load profile.");
  }
}

/**
 * Updates the current user's profile.
 * PUT /v1/user/me — gateway UserController.updateMe injects the userId from the
 * auth token and forwards the body to IAM. Returns the updated profile.
 */
export async function updateProfile(
  data: UpdateUserRequest,
): Promise<ProfileData> {
  try {
    const res = await getClientAxios().put<ApiEnvelope<ProfileData>>(
      "/v1/user/me",
      data,
    );
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error) || "Failed to update profile.");
  }
}
