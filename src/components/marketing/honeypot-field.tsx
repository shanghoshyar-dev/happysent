import { HONEYPOT_FIELD_NAME } from "@/lib/honeypot";

/**
 * Osynligt fält för bot-skydd. Människor ska lämna det tomt; bots fyller ofta i alla fält.
 */
export function HoneypotField() {
  return (
    <div
      className="absolute -left-[10000px] top-auto h-0 w-0 overflow-hidden opacity-0"
      aria-hidden="true"
    >
      <label htmlFor={HONEYPOT_FIELD_NAME}>Faxnummer (lämna tomt)</label>
      <input
        type="text"
        id={HONEYPOT_FIELD_NAME}
        name={HONEYPOT_FIELD_NAME}
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  );
}
