
export function normalizePhone(phone) {
  if (typeof phone !== "string") return null;

  let normalized = phone.trim().replace(/[\s()-]/g, "");

  if (normalized.startsWith("+98")) {
    normalized = "0" + normalized.slice(3);
  } else if (normalized.startsWith("0098")) {
    normalized = "0" + normalized.slice(4);
  } else if (normalized.startsWith("98")) {
    normalized = "0" + normalized.slice(2);
  } else if (/^9\d{9}$/.test(normalized)) {
    normalized = "0" + normalized;
  }

  return /^09\d{9}$/.test(normalized) ? normalized : null;
}
