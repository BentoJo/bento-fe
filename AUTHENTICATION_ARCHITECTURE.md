# Authentication Architecture Documentation

## Overview

This document explains how authentication works in the Bento frontend application. The system uses:

- **NextAuth.js** for session management with JWT strategy
- **HttpOnly Cookies** for storing sensitive tokens (secure, XSS-protected)
- **Axios Interceptors** for automatic token injection and refresh
- **Backend OTP verification** for user authentication
- **Automatic token refresh** when access token expires

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Login Page (OTP Verification)                    │  │
│  │  - User enters email                                     │  │
│  │  - Receives OTP via email                                │  │
│  │  - Submits OTP to /auth/verify-otp                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │   Backend Response (from /auth/verify-otp)               │  │
│  │   {                                                       │  │
│  │     user: { id, email, firstName, lastName, avatarUrl }  │  │
│  │     accessToken: "jwt...",                               │  │
│  │     accessTokenExpiresAt: 1234567890,                    │  │
│  │     refreshTokenExpiresAt: 1234567890                    │  │
│  │     [+ cookies set: refreshToken, deviceToken, sessionId]│  │
│  │   }                                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │     signIn('credentials', {                              │  │
│  │       accessToken,                                       │  │
│  │       refreshToken: "", // Empty (in cookie)             │  │
│  │       user: JSON.stringify(user),                        │  │
│  │       accessTokenExpiresAt,                              │  │
│  │       refreshTokenExpiresAt                              │  │
│  │     })                                                    │  │
│  │                                                           │  │
│  │   → NextAuth Credentials Provider                        │  │
│  │   → authorize() callback parses & validates              │  │
│  │   → JWT callback stores tokens in session                │  │
│  │   → Session callback maps to user context                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │   NextAuth Session Created                               │  │
│  │   {                                                       │  │
│  │     accessToken: "jwt...",                               │  │
│  │     refreshToken: "jwt..." (optional, usually undefined) │  │
│  │     user: { id, email, firstName, lastName, avatarUrl }  │  │
│  │   }                                                       │  │
│  │                                                           │  │
│  │   Browser Cookies:                                       │  │
│  │   - next-auth.session-token (encrypted session)          │  │
│  │   - refreshToken (httpOnly, secure)                      │  │
│  │   - deviceToken (httpOnly, secure)                       │  │
│  │   - sessionId (httpOnly, secure)                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Axios Client Instance                            │  │
│  │                                                           │  │
│  │  Request Interceptor:                                    │  │
│  │  - Fetches session via getSession()                      │  │
│  │  - Sets Authorization: Bearer {accessToken}              │  │
│  │  - Adds device headers (x-device-*)                      │  │
│  │  - Sends with withCredentials: true (auto-sends cookies) │  │
│  │                                                           │  │
│  │  Response Interceptor (on 401):                          │  │
│  │  - Calls refreshAccessToken()                            │  │
│  │  - Sends refreshToken cookie (credentials: include)      │  │
│  │  - Backend returns new tokens in cookies                 │  │
│  │  - Gets new session                                      │  │
│  │  - Retries original request with new token               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                           ▲
                           │ HTTP Requests with:
                           │ - Authorization: Bearer {accessToken}
                           │ - x-device-* headers
                           │ - Cookies (auto-sent)
                           │
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (NestJS)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  /auth/verify-otp → OTP verification, generates tokens          │
│  /auth/refresh-token → Receives refreshToken cookie             │
│  /api/* → Protected routes validate Authorization header        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Token Management Flow

### 1. Initial Login (OTP Verification)

**Frontend:**

```typescript
// User submits OTP verification
const response = await axios.post<VerifyOtpResponse>("/auth/verify-otp", {
  email,
  code,
});
// Response contains:
// {
//   user: { id, email, firstName, lastName, avatarUrl },
//   accessToken: "eyJhbGciOiJIUzI1NiI...",
//   accessTokenExpiresAt: 1234567890,
//   refreshTokenExpiresAt: 1234567890
// }
```

**Backend Sets Cookies:**

```typescript
// In auth.controller.ts /auth/verify-otp endpoint
res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);
res.cookie("deviceToken", result.session.deviceId, DEVICE_COOKIE_OPTIONS);
res.cookie("sessionId", result.session.sessionId, COOKIE_OPTIONS);
// COOKIE_OPTIONS: { httpOnly: true, secure: true, sameSite: 'lax' }
```

**Frontend: Call NextAuth signIn**

```typescript
const result = await signIn("credentials", {
  accessToken: response.data.accessToken,
  refreshToken: "", // Empty - token is in httpOnly cookie
  user: JSON.stringify(response.data.user),
  accessTokenExpiresAt: response.data.accessTokenExpiresAt,
  refreshTokenExpiresAt: response.data.refreshTokenExpiresAt,
});
```

### 2. NextAuth Processing

**Credentials Provider authorize() callback:**

```typescript
async authorize(credentials): Promise<AuthorizedUser | null> {
  // Validates credentials format
  const parsed = parseCredentials(credentials);

  if (!parsed.accessToken || !parsed.user) {
    throw new Error("Missing required credentials.");
  }

  const user = parseUserFromCredentials(parsed.user);

  return {
    accessToken: parsed.accessToken,
    refreshToken: parsed.refreshToken, // Empty string
    accessTokenExpiresAt: parsed.accessTokenExpiresAt,
    refreshTokenExpiresAt: parsed.refreshTokenExpiresAt,
    ...user,
  };
}
```

**JWT Callback (stores tokens in JWT/session):**

```typescript
async jwt({ token, user }): Promise<JWT> {
  if (user) {
    // Initial login - user object provided
    (token as AuthenticatedJWT).accessToken = userData.accessToken;
    (token as AuthenticatedJWT).refreshToken = userData.refreshToken;
    (token as AuthenticatedJWT).accessTokenExpiresAt = Number(userData.accessTokenExpiresAt);
    (token as AuthenticatedJWT).refreshTokenExpiresAt = Number(userData.refreshTokenExpiresAt);
    (token as AuthenticatedJWT).user = userData;
    return token;
  }

  const authToken = token as AuthenticatedJWT;
  const shouldRefresh = Date.now() >= authToken.accessTokenExpiresAt * 1000;

  if (!shouldRefresh) {
    return token; // Token still valid
  }

  // Token expired - refresh it
  try {
    const refreshedTokens = await refreshAccessToken();
    (token as AuthenticatedJWT).accessToken = refreshedTokens.accessToken;
    (token as AuthenticatedJWT).refreshToken = refreshedTokens.refreshToken;
    (token as AuthenticatedJWT).accessTokenExpiresAt = Number(refreshedTokens.accessTokenExpiresAt);
    (token as AuthenticatedJWT).refreshTokenExpiresAt = Number(refreshedTokens.refreshTokenExpiresAt);
    return token;
  } catch (error) {
    (token as AuthenticatedJWT).error = "RefreshAccessTokenError";
    return token;
  }
}
```

**Session Callback (creates user context):**

```typescript
async session({ session, token }): Promise<Session> {
  const authToken = token as AuthenticatedJWT;
  const authSession = session as AuthenticatedSession;

  authSession.accessToken = authToken.accessToken;
  authSession.refreshToken = authToken.refreshToken;
  authSession.user = authToken.user;
  authSession.error = authToken.error;

  return authSession;
}
```

**Result: NextAuth Session Created**

```typescript
{
  accessToken: "eyJhbGciOiJIUzI1NiI...",
  refreshToken: "eyJhbGciOiJIUzI1NiI..." (optional),
  user: { id, email, firstName, lastName, avatarUrl },
  error?: string
}
```

---

## Axios Client Configuration

**File:** `lib/api/client.ts`

### Instance Creation

```typescript
const instance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ✅ IMPORTANT: Sends cookies automatically
});
```

**Why `withCredentials: true`?**

- Tells Axios to include credentials (cookies) in every request
- Browser automatically sends httpOnly cookies (refreshToken, deviceToken, sessionId)
- Makes cookies available to backend without manual header injection

### Request Interceptor

```typescript
instance.interceptors.request.use(
  async (config) => {
    // 1. Get current session (from NextAuth)
    const session = (await getSession()) as AuthenticatedSession | null;

    // 2. Add Authorization header with accessToken
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }

    // 3. Add device headers (fingerprint, platform, etc.)
    const deviceHeaders = getHeadersForRequest();
    Object.entries(deviceHeaders).forEach(([key, value]) => {
      if (value) {
        config.headers[key] = value;
      }
    });

    return config;
  },
  (error) => Promise.reject(error),
);
```

**What headers are added?**

```
Authorization: Bearer {accessToken}
x-device-fingerprint: hash of device info
x-device-name: Chrome
x-device-type: desktop
x-device-platform: windows
x-device-hardware-concurrency: 8
x-device-timezone: Asia/Amman
x-device-language: en
x-platform: web
x-client-version: 1.0.0
x-timezone: Asia/Amman
x-request-id: uuid-v4
x-session-id: null (sent via cookie instead)
+ Cookies (auto-sent):
  - refreshToken (httpOnly)
  - deviceToken (httpOnly)
  - sessionId (httpOnly)
```

### Response Interceptor (Token Refresh)

```typescript
instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosError["config"] & {
      _retry?: boolean;
      headers: AxiosRequestHeaders;
    };

    // Only retry if:
    // 1. Status is 401 (unauthorized)
    // 2. Original request exists
    // 3. Haven't already retried this request
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // 1. Call refresh endpoint
        // - Automatically sends refreshToken cookie (credentials: include)
        // - Backend returns new tokens in cookies
        await refreshAccessToken();

        // 2. Get updated session
        const session = (await getSession()) as AuthenticatedSession | null;

        // 3. Update request with new accessToken
        if (session?.accessToken) {
          originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;

          // 4. Retry original request
          return instance(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Redirect to login in middleware or caller
      }
    }

    return Promise.reject(error);
  },
);
```

---

## Token Refresh Flow

### When Token Refresh Happens

**Option 1: Automatic (in NextAuth JWT callback)**

```typescript
// In jwt callback:
const shouldRefresh = Date.now() >= authToken.accessTokenExpiresAt * 1000;
if (!shouldRefresh) {
  return token; // Still valid
}

// Token expired - refresh automatically
const refreshedTokens = await refreshAccessToken();
(token as AuthenticatedJWT).accessToken = refreshedTokens.accessToken;
```

This happens when `getSession()` is called and the accessToken is expired.

**Option 2: On Demand (when API returns 401)**

```typescript
// In axios response interceptor:
if (error.response?.status === 401) {
  await refreshAccessToken();
  const session = (await getSession()) as AuthenticatedSession | null;
  // Retry with new token
}
```

This happens if a request receives a 401 response.

### Refresh Token Request

**File:** `auth/refresh-token.ts`

```typescript
export async function refreshAccessToken(): Promise<AuthTokens> {
  const endpoint = process.env.NEXT_PUBLIC_API_URL;

  const response = await fetch(`${endpoint}/auth/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // ✅ Sends cookies (refreshToken, deviceToken, sessionId)
  });

  if (!response.ok) {
    throw new Error("Failed to refresh access token.");
  }

  // Returns: { accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt }
  return response.json();
}
```

**Backend processes refresh:**

```typescript
// In backend /auth/refresh-token endpoint:
// 1. Receives refreshToken from cookie (via credentials: include)
// 2. Validates refreshToken
// 3. Generates new accessToken
// 4. Returns new tokens in response
// 5. Sets new tokens in cookies:
//    - res.cookie('refreshToken', newToken, COOKIE_OPTIONS);
//    - res.cookie('deviceToken', deviceId, DEVICE_COOKIE_OPTIONS);
```

---

## Token Storage Location

| Token            | Storage                | Accessible From             | Use Case                              | Security                     |
| ---------------- | ---------------------- | --------------------------- | ------------------------------------- | ---------------------------- |
| **accessToken**  | NextAuth Session (JWT) | Frontend via `getSession()` | Authorization header for API requests | ✅ In memory (session)       |
| **refreshToken** | httpOnly Cookie        | Only Backend (via cookies)  | Refresh new accessToken               | ✅✅ HttpOnly, XSS-protected |
| **deviceToken**  | httpOnly Cookie        | Only Backend (via cookies)  | Device identification                 | ✅✅ HttpOnly, XSS-protected |
| **sessionId**    | httpOnly Cookie        | Only Backend (via cookies)  | Session tracking                      | ✅✅ HttpOnly, XSS-protected |

**Key Points:**

- ✅ accessToken is NOT stored in a cookie (stays in NextAuth session)
- ✅ refreshToken NEVER sent to frontend code (only in httpOnly cookie)
- ✅ deviceToken created by backend, sent via cookie
- ✅ sessionId created by backend, sent via cookie
- ✅ Browser automatically sends all httpOnly cookies with `credentials: include`
- ✅ Frontend code cannot access httpOnly cookies (XSS protection)

---

## Complete Login → API Request Flow

### Step 1: User Logs In (OTP Verification)

```
User submits OTP
        ↓
axios.post("/auth/verify-otp", { email, code })
        ↓
Backend: OTP verified ✅
Backend: Generated tokens & set cookies
Response: { user, accessToken, accessTokenExpiresAt, refreshTokenExpiresAt }
        ↓
Cookies set in browser:
  - refreshToken (httpOnly)
  - deviceToken (httpOnly)
  - sessionId (httpOnly)
```

### Step 2: Call signIn (NextAuth)

```
signIn('credentials', {
  accessToken,
  refreshToken: "",
  user: JSON.stringify(user),
  accessTokenExpiresAt,
  refreshTokenExpiresAt
})
        ↓
NextAuth Credentials Provider:
  authorize() → validates & returns user
        ↓
NextAuth JWT callback:
  - Stores tokens in JWT
  - Checks expiry (for next time)
        ↓
NextAuth Session callback:
  - Maps JWT to Session object
  - Returns { accessToken, refreshToken, user }
```

### Step 3: Session Created

```
NextAuth Session = {
  accessToken: "eyJhbGciOiJIUzI1NiI...",
  refreshToken: undefined (not stored in session),
  user: { id, email, firstName, lastName, avatarUrl }
}

Cookies in browser = {
  next-auth.session-token: encrypted,
  refreshToken: encrypted,
  deviceToken: encrypted,
  sessionId: encrypted
}
```

### Step 4: Make API Request

```
axios.get("/api/profile")
        ↓
Request Interceptor:
  - getSession() → Returns { accessToken, user }
  - Sets Authorization: Bearer {accessToken}
  - Adds x-device-* headers
  - Sets withCredentials: true (sends cookies)
        ↓
HTTP Request sent with:
  - Authorization: Bearer {accessToken}
  - x-device-* headers
  - Cookies (auto-sent by browser):
    * refreshToken
    * deviceToken
    * sessionId
        ↓
Backend receives:
  - Validates accessToken from Authorization header
  - Reads sessionId from cookie
  - Reads deviceToken from cookie
  - Reads refreshToken from cookie (only if needed)
  - Returns protected data
        ↓
Response 200 OK
```

### Step 5: Token Expires (Automatic Refresh)

```
Next getSession() called
        ↓
NextAuth JWT callback checks:
  Date.now() >= accessTokenExpiresAt * 1000 ?
        ↓
YES - Token expired
        ↓
Call refreshAccessToken():
  fetch("/auth/refresh-token", {
    credentials: "include"  // Sends refreshToken cookie
  })
        ↓
Backend:
  - Receives refreshToken from cookie
  - Validates it
  - Generates new accessToken
  - Returns new tokens
  - Sets new cookies
        ↓
Response: { accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt }
        ↓
JWT callback updates:
  (token as AuthenticatedJWT).accessToken = newAccessToken
        ↓
Session callback returns updated session
        ↓
getSession() returns new accessToken
```

### Step 6: Token Expires During Request (401 Response)

```
axios.get("/api/profile")
        ↓
Request made with expired accessToken
        ↓
Backend returns 401 Unauthorized
        ↓
Response Interceptor catches 401:
  if (!originalRequest._retry) {
    originalRequest._retry = true
    await refreshAccessToken()
    const session = getSession()
    originalRequest.headers.Authorization = Bearer {newAccessToken}
    return instance(originalRequest)  // Retry
  }
        ↓
Retry request with new token
        ↓
Backend returns 200 OK
```

---

## Type Safety

### Module Augmentation (next-auth.d.ts)

```typescript
declare module "next-auth" {
  interface Session {
    accessToken: string;
    refreshToken?: string;
    user: UserInfo;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken?: string;
    accessTokenExpiresAt: number;
    refreshTokenExpiresAt: number;
    user: UserInfo;
    error?: string;
  }
}
```

### Helper Types (types/auth/next-auth.ts)

```typescript
export type AuthenticatedSession = Session & {
  accessToken: string;
  refreshToken?: string;
  error?: string;
};

export type AuthenticatedJWT = JWT & {
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
  user: UserInfo;
  error?: string;
};

export interface CredentialsInput {
  accessToken: string;
  refreshToken: string;
  user: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}
```

---

## Answer: Does Client Receive and Save Tokens?

### ✅ YES - Access Token

- **Received:** ✅ From backend in /auth/verify-otp response
- **Saved:** ✅ In NextAuth session (JWT strategy)
- **Access:** ✅ Via `getSession()` throughout the app
- **Storage Type:** Memory (NextAuth session)

### ✅ YES - Refresh Token

- **Received:** ✅ From backend as httpOnly cookie
- **Saved:** ✅ As httpOnly cookie (browser-managed)
- **Access:** ❌ Frontend code cannot read it (XSS protection)
- **Storage Type:** HttpOnly cookie (auto-managed by browser)
- **Why:** Security - only backend can read/send refresh tokens

### ✅ YES - Device Token

- **Received:** ✅ From backend as httpOnly cookie
- **Saved:** ✅ As httpOnly cookie (browser-managed)
- **Access:** ❌ Frontend code cannot read it (XSS protection)
- **Storage Type:** HttpOnly cookie (auto-managed by browser)
- **Why:** Security - device identification server-side

### ✅ YES - Session ID

- **Received:** ✅ From backend as httpOnly cookie
- **Saved:** ✅ As httpOnly cookie (browser-managed)
- **Access:** ❌ Frontend code cannot read it (XSS protection)
- **Storage Type:** HttpOnly cookie (auto-managed by browser)
- **Why:** Security - session tracking server-side

---

## Summary

| Aspect                | Implementation                                                         |
| --------------------- | ---------------------------------------------------------------------- |
| **Session Strategy**  | NextAuth JWT (not database)                                            |
| **Access Token**      | In NextAuth session, added to Authorization header                     |
| **Refresh Token**     | HttpOnly cookie, sent automatically by browser                         |
| **Device Token**      | HttpOnly cookie, sent automatically by browser                         |
| **Session ID**        | HttpOnly cookie, sent automatically by browser                         |
| **Token Refresh**     | Automatic when getSession() detects expiry, or on 401 response         |
| **Axios Integration** | Request interceptor adds auth header, response interceptor handles 401 |
| **Type Safety**       | Full TypeScript with AuthenticatedSession & AuthenticatedJWT types     |
| **Security**          | HttpOnly cookies prevent XSS, no sensitive data in localStorage        |
