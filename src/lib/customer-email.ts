const BLOCKED_EMAIL_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "localhost",
  "mailinator.com",
  "yopmail.com",
  "guerrillamail.com",
  "tempmail.com",
  "10minutemail.com",
  "fakeinbox.com",
  "trashmail.com",
]);

/** Reject placeholder / disposable addresses for checkout and registration. */
export function isAllowedCustomerEmail(raw: string): boolean {
  const email = raw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  const [, domain] = email.split("@");
  if (!domain) return false;
  if (BLOCKED_EMAIL_DOMAINS.has(domain)) return false;
  if (domain.endsWith(".test") || domain.startsWith("test.")) return false;
  if (email.includes("+test") || email.startsWith("test@")) return false;
  return true;
}

export function customerEmailError(raw: string): string | undefined {
  const email = raw.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Enter a valid email address.";
  }
  if (!isAllowedCustomerEmail(email)) {
    return "Use your real email address (not a test or placeholder inbox).";
  }
  return undefined;
}
