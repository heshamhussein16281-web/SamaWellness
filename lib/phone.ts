// Shared phone number validator + normalizer (Action 13).
//
// Used on both the client (inline validation on blur/submit in the booking
// modals) and the server (/api/booking — the authoritative gate) so a
// wrong-length or malformed number can never be saved as a lead. See the
// Action 13 plan for the exact rules; summarized:
//
// 1. Normalize input: Arabic-Indic digits (٠-٩) -> 0-9, strip spaces,
//    dashes, and brackets.
// 2. Egyptian mobile: after removing a leading +20 / 0020 / 20, the number
//    must be exactly 11 digits starting with 010/011/012/015. Also accept
//    10 digits starting with 10/11/12/15 (missing leading 0 — it's added
//    back in the normalized form).
// 3. International (non-Egypt): starts with + or 00 and the country code is
//    NOT 20 -> accept 8-15 digits total (E.164-ish).
// 4. Anything else is invalid.

export interface PhoneValidationResult {
  valid: boolean;
  /** Canonical stored form: "01xxxxxxxxx" for Egypt, "+<countrycode><rest>"
   *  for international. Empty string when invalid. */
  normalized: string;
}

const EGYPT_MOBILE_PREFIXES = ["10", "11", "12", "15"];

export function validatePhone(rawInput: string | null | undefined): PhoneValidationResult {
  if (!rawInput) return { valid: false, normalized: "" };

  // Step 1: Arabic-Indic digits -> ASCII, strip spaces/dashes/brackets.
  const asciiDigits = rawInput.replace(/[٠-٩]/g, (d) =>
    String(d.charCodeAt(0) - 0x0660)
  );
  const cleaned = asciiDigits.replace(/[\s\-‐-―()[\]]/g, "");

  // From here, only digits and a single optional leading "+" are allowed —
  // anything else (letters, stray punctuation) is invalid per rule 4.
  if (!/^\+?\d+$/.test(cleaned)) {
    return { valid: false, normalized: "" };
  }

  const hasPlus = cleaned.startsWith("+");
  const digits = hasPlus ? cleaned.slice(1) : cleaned;

  // Step 2: Egyptian mobile — strip a leading +20 / 0020 / 20 country code
  // before checking the local-number shape.
  let egyptLocal = digits;
  if (hasPlus && digits.startsWith("20")) {
    egyptLocal = digits.slice(2);
  } else if (!hasPlus && digits.startsWith("0020")) {
    egyptLocal = digits.slice(4);
  } else if (!hasPlus && digits.startsWith("20") && digits.length >= 12) {
    // Bare "20" country code without a "+" or "00" prefix, e.g. 201012345678.
    egyptLocal = digits.slice(2);
  }

  if (
    egyptLocal.length === 11 &&
    egyptLocal[0] === "0" &&
    EGYPT_MOBILE_PREFIXES.includes(egyptLocal.slice(1, 3))
  ) {
    return { valid: true, normalized: egyptLocal };
  }
  if (egyptLocal.length === 10 && EGYPT_MOBILE_PREFIXES.includes(egyptLocal.slice(0, 2))) {
    return { valid: true, normalized: "0" + egyptLocal };
  }

  // Step 3: International (non-Egypt) — must start with + or 00, and the
  // country code must not be 20 (that's Egypt's, handled above).
  if (hasPlus || digits.startsWith("00")) {
    const intlDigits = hasPlus ? digits : digits.slice(2);
    if (!intlDigits.startsWith("20") && intlDigits.length >= 8 && intlDigits.length <= 15) {
      return { valid: true, normalized: "+" + intlDigits };
    }
  }

  // Step 4: anything else is invalid.
  return { valid: false, normalized: "" };
}

export const PHONE_ERROR_EN =
  "Please enter a valid mobile number (e.g. 01012345678). For numbers outside Egypt, start with the country code (e.g. +966…).";

export const PHONE_ERROR_AR =
  "من فضلك اكتب رقم موبايل صحيح (مثال: 01012345678). لو الرقم من خارج مصر ابدأ بكود الدولة (مثال: +966…).";
