"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const RESET_MS = 1500;
const REQUIRED_PRESSES = 3;

function isFormField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest('input, textarea, select, [contenteditable="true"]'),
  );
}

/** Dold genväg: Enter × 3 (utan fokus i formulär) → /login */
export function AdminLoginShortcut() {
  const router = useRouter();
  const pathname = usePathname();
  const countRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const reset = () => {
      countRef.current = 0;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter") {
        reset();
        return;
      }
      if (isFormField(event.target)) return;
      if (pathname === "/login") return;

      countRef.current += 1;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(reset, RESET_MS);

      if (countRef.current >= REQUIRED_PRESSES) {
        reset();
        router.push("/login");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      reset();
    };
  }, [pathname, router]);

  return null;
}
