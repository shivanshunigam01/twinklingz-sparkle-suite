const TOKEN_KEY = "twinklingz_customer_token";
const PROFILE_KEY = "twinklingz_customer_profile";

export type CustomerProfile = {
  id: string;
  email: string;
  name: string;
};

export function getCustomerToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setCustomerSession(token: string, customer: CustomerProfile) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(PROFILE_KEY, JSON.stringify(customer));
  window.dispatchEvent(new Event("twinklingz-customer-auth"));
}

export function clearCustomerSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);
  window.dispatchEvent(new Event("twinklingz-customer-auth"));
}

export function getCustomerProfile(): CustomerProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as CustomerProfile) : null;
  } catch {
    return null;
  }
}

export function isCustomerAuthed() {
  return Boolean(getCustomerToken());
}
