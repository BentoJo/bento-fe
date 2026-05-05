// Register Types
interface APIResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

// OTP Types
export interface VerifyOtpRequest {
  email: string;
  code: string;
}

export interface OtpResendRequest {
  email: string;
}

export interface OtpResendResponse {
  method: string;
  email: string;
  expiresIn: string;
  success: boolean;
  message: string;
}

export interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface SessionInfo {
  sessionId: string;
  deviceId: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: UserInfo;
  session: SessionInfo;
  success: boolean;
  message: string;
}

// Refresh Token Types
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

// JWT Payload (for reference)
export interface AccessTokenPayload {
  sub: string;
  deviceId: string;
  globalRole: string;
}
