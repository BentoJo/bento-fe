"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Countdown timer for OTP resend cooldown.
 * `start(duration)` begins a countdown; `formatted` is mm:ss while active, null when idle.
 */
export function useResendTimer() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(
    (duration: number) => {
      clear();
      setRemaining(duration);
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (!prev || prev <= 1) {
            clear();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [clear],
  );

  const reset = useCallback(() => {
    clear();
    setRemaining(null);
  }, [clear]);

  useEffect(() => clear, [clear]);

  const formatted =
    remaining != null
      ? `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(
          remaining % 60,
        ).padStart(2, "0")}`
      : null;

  return { remaining, formatted, start, reset };
}
