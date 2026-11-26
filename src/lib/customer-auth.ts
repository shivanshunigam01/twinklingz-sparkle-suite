const TOKEN_KEY = "twinklingz_customer_token";
const PROFILE_KEY = "twinklingz_customer_profile";

export type SavedShipping = {
  address: string;
  landmark: string;
  locality: string;
  city: string;
  state: string;
  pinCode: string;
};

export type CustomerProfile = {
  id: string;
  email: string;
  name: string;
  mobile?: string;
  savedShipping?: SavedShipping;
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

export function hasSavedCheckoutProfile(customer: CustomerProfile | null | undefined): boolean {
  if (!customer) return false;
  const s = customer.savedShipping;
  return Boolean(s?.address?.trim());
}

export function defaultContactFromCustomer(customer: CustomerProfile): Pick<
  { fullName: string; email: string; mobile: string },
  "fullName" | "email" | "mobile"
> {
  return {
    fullName: customer.name,
    email: customer.email,
    mobile: customer.mobile?.trim() ?? "",
  };
}

export function savedShippingToForm(saved: SavedShipping | undefined): Partial<{
  address: string;
  landmark: string;
  locality: string;
  city: string;
  state: string;
  pinCode: string;
}> {
  if (!saved?.address?.trim()) return {};
  return {
    address: saved.address,
    landmark: saved.landmark ?? "",
    locality: saved.locality ?? "",
    city: saved.city ?? "",
    state: saved.state ?? "",
    pinCode: saved.pinCode ?? "",
  };
}