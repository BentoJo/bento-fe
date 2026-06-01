/**
 * Every gateway response is wrapped by its ResponseInterceptor as
 * `{ success, message, data }` — unless the service payload already carries
 * `success`/`message` (then it is passed through unwrapped).
 */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}
