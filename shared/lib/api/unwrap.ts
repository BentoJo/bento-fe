import type { AxiosResponse } from "axios";

/**
 * The gateway's ResponseInterceptor wraps payloads as { success, message, data }
 * UNLESS the service response already carries success/message (then it is passed
 * through flat). This flattens both shapes so callers always read fields at the
 * top level: payload fields + success/message.
 */
export function unwrap<T = Record<string, unknown>>(response: AxiosResponse): T {
  const body = response?.data;

  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    body.data &&
    typeof body.data === "object" &&
    ("success" in body || "message" in body)
  ) {
    const { data, ...meta } = body as Record<string, unknown>;
    return { ...(data as object), ...meta } as T;
  }

  return body as T;
}
