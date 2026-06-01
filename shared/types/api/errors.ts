import type { AxiosError } from "axios";

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

export type AxiosErrorType = AxiosError<ApiErrorResponse>;

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const axiosError = error as AxiosErrorType;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }
    if (axiosError.message) {
      return axiosError.message;
    }
  }

  return "An unexpected error occurred";
}

export function isErrorStatus(
  error: unknown,
  status: number,
): error is AxiosErrorType {
  if (typeof error === "object" && error !== null) {
    const axiosError = error as AxiosErrorType;
    return axiosError.response?.status === status;
  }
  return false;
}
