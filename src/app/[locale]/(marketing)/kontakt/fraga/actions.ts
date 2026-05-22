"use server";

import { getRequestIp } from "@/lib/client-ip";
import { isHoneypotFilled } from "@/lib/honeypot";
import {
  ContactRateLimitError,
  assertContactRateLimit,
} from "@/lib/rate-limit-contact";
import {
  sendContactConfirmation,
  sendGeneralQuestionAdminNotification,
} from "@/lib/resend/templates";

export type GeneralQuestionState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

function getStr(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isPlausiblePhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

export async function submitGeneralQuestion(
  _prev: GeneralQuestionState,
  formData: FormData,
): Promise<GeneralQuestionState> {
  if (isHoneypotFilled(formData)) {
    return { status: "success" };
  }

  const firstName = getStr(formData, "first_name");
  const lastName = getStr(formData, "last_name");
  const email = getStr(formData, "email");
  const phone = getStr(formData, "phone");
  const message = getStr(formData, "message");

  if (!firstName || !lastName || !email || !phone || !message) {
    return { status: "error", message: "fillRequired" };
  }
  if (!isValidEmail(email)) {
    return { status: "error", message: "invalidEmail" };
  }
  if (!isPlausiblePhone(phone)) {
    return { status: "error", message: "invalidPhone" };
  }

  try {
    await assertContactRateLimit(getRequestIp());
  } catch (e) {
    if (e instanceof ContactRateLimitError) {
      return { status: "error", message: e.message };
    }
    throw e;
  }

  try {
    await sendGeneralQuestionAdminNotification({
      firstName,
      lastName,
      email,
      phone,
      message,
    });
    await sendContactConfirmation({
      to: email,
      name: firstName,
    });
  } catch (e) {
    console.error("[submitGeneralQuestion]", e);
    return { status: "error", message: "sendFailed" };
  }

  return { status: "success" };
}
