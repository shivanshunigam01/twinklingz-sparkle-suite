export type CheckoutFormValues = {
  fullName: string;
  mobile: string;
  email: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
  pinCode: string;
  locality: string;
};

export type CheckoutFieldErrors = Partial<Record<keyof CheckoutFormValues, string>>;

export function normalizeIndianMobile(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

export function validateCheckoutForm(values: CheckoutFormValues, requireLocality: boolean): CheckoutFieldErrors {
  const errors: CheckoutFieldErrors = {};
  const name = values.fullName.trim();
  if (name.length < 2) {
    errors.fullName = "Enter your full name (at least 2 characters).";
  } else if (!/^[\p{L}\s.'-]+$/u.test(name)) {
    errors.fullName = "Name can only contain letters and spaces.";
  }

  const mobile = normalizeIndianMobile(values.mobile);
  if (!/^[6-9]\d{9}$/.test(mobile)) {
    errors.mobile = "Enter a valid 10-digit Indian mobile number (starts with 6–9).";
  }

  const email = values.email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  const pin = values.pinCode.replace(/\D/g, "");
  if (!/^\d{6}$/.test(pin)) {
    errors.pinCode = "PIN code must be exactly 6 digits.";
  }

  if (requireLocality && !values.locality.trim()) {
    errors.locality = "Select your area / locality for this PIN code.";
  }

  const address = values.address.trim();
  if (address.length < 5) {
    errors.address = "Enter your house / street address (at least 5 characters).";
  }

  if (!values.city.trim()) {
    errors.city = "City is required — enter PIN code to autofill or type manually.";
  }
  if (!values.state.trim()) {
    errors.state = "State is required — enter PIN code to autofill or type manually.";
  }

  return errors;
}

export function hasCheckoutErrors(errors: CheckoutFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
