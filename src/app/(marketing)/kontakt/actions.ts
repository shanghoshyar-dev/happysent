"use server";

import {
  sendContactAdminNotification,
  sendContactConfirmation,
  sendEmployeeRequestAdminNotification,
} from "@/lib/resend/templates";

export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

function getStr(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptStr(formData: FormData, key: string): string | null {
  const v = getStr(formData, key);
  return v === "" ? null : v;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function submitContactForm(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = getStr(formData, "name");
  const company = getStr(formData, "company");
  const email = getStr(formData, "email");
  const message = getStr(formData, "message");
  const consent = formData.get("consent") === "on";

  if (!name || !company || !email) {
    return { status: "error", message: "Fyll i namn, företag och mejl." };
  }
  if (!isValidEmail(email)) {
    return { status: "error", message: "Mejladressen ser inte giltig ut." };
  }
  if (!consent) {
    return {
      status: "error",
      message:
        "Du behöver godkänna integritetspolicyn och databehandlingsavtalet.",
    };
  }

  try {
    await sendContactAdminNotification({ name, company, email, message });
    await sendContactConfirmation({ to: email, name });
    return { status: "success" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Okänt fel";
    return {
      status: "error",
      message: `Något gick fel när vi skulle skicka mejlet: ${msg}`,
    };
  }
}

export async function submitEmployeeRequest(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const rawAction = getStr(formData, "action_type");
  if (rawAction !== "add" && rawAction !== "remove") {
    return { status: "error", message: "Välj om du vill lägga till eller ta bort." };
  }
  const action = rawAction;

  const companyName = getStr(formData, "company_name");
  const address = getStr(formData, "address");
  const city = getStr(formData, "city");
  const postalCode = getStr(formData, "postal_code");
  const firstName = getStr(formData, "first_name");
  const lastName = getStr(formData, "last_name");
  const submittedByEmail = getStr(formData, "submitted_by_email");
  const message = getStr(formData, "message");

  const birthday = action === "add" ? getOptStr(formData, "birthday") : null;
  const rawNumber = getStr(formData, "number_of_people");
  const numberOfPeople =
    action === "add" && rawNumber !== "" ? Number(rawNumber) : null;

  if (!companyName || !address || !city || !postalCode || !firstName || !lastName) {
    return {
      status: "error",
      message: "Fyll i företagsuppgifter och anställdas namn.",
    };
  }
  if (!isValidEmail(submittedByEmail)) {
    return {
      status: "error",
      message: "Vi behöver en giltig mejladress att svara på.",
    };
  }
  if (action === "add") {
    if (!birthday) {
      return { status: "error", message: "Födelsedag krävs när du lägger till." };
    }
    if (numberOfPeople === null || Number.isNaN(numberOfPeople) || numberOfPeople < 1) {
      return {
        status: "error",
        message: "Antal personer måste vara minst 1.",
      };
    }
  }

  try {
    await sendEmployeeRequestAdminNotification({
      action,
      companyName,
      address,
      city,
      postalCode,
      employeeFirstName: firstName,
      employeeLastName: lastName,
      birthday,
      numberOfPeople,
      message,
      submittedByEmail,
    });
    await sendContactConfirmation({
      to: submittedByEmail,
      name: firstName || companyName,
    });
    return { status: "success" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Okänt fel";
    return {
      status: "error",
      message: `Något gick fel när vi skulle skicka mejlet: ${msg}`,
    };
  }
}
