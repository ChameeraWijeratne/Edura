/**
 * Links for the Internships page. Replace with your real WhatsApp number and
 * LinkedIn company or team profile before going live.
 *
 * WhatsApp: E.164 digits only — country code + number, no + or spaces.
 * Example (Sri Lanka): 94771234567
 */
const WHATSAPP_E164 = "94771234567";

const WHATSAPP_PREFILL =
  "Hello Edura — I would like to publish a free internship listing.\n\n" +
  "Organization:\n" +
  "Role title:\n" +
  "Location (on-site / hybrid / remote):\n" +
  "Duration & start window:\n" +
  "How to apply (link or email):\n";

export const INTERNSHIP_WHATSAPP_HREF = `https://wa.me/${WHATSAPP_E164}?text=${encodeURIComponent(
  WHATSAPP_PREFILL
)}`;

/** LinkedIn company page, showcase page, or profile where you accept DMs about listings */
export const INTERNSHIP_LINKEDIN_HREF = "https://www.linkedin.com/company/edura";
