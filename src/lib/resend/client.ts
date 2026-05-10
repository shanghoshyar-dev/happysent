import "server-only";

import { Resend } from "resend";

import { requireEnv } from "@/lib/env";

let cached: Resend | null = null;

export function getResend(): Resend {
  if (!cached) {
    cached = new Resend(requireEnv("RESEND_API_KEY"));
  }
  return cached;
}
