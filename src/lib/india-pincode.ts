/** India Post PIN data via https://api.postalpincode.in (no API key). */

export type PostOffice = {
  Name: string;
  Description: string;
  BranchType: string;
  DeliveryStatus: string;
  Circle: string;
  District: string;
  Division: string;
  Region: string;
  Block: string;
  State: string;
  Country: string;
  Pincode: string;
};

type PincodeApiRow = {
  Message: string;
  Status: string;
  PostOffice: PostOffice[] | null;
};

export async function fetchPostOfficesByPincode(pinCode: string): Promise<PostOffice[]> {
  const pin = pinCode.replace(/\D/g, "");
  if (!/^\d{6}$/.test(pin)) {
    throw new Error("PIN code must be 6 digits.");
  }

  const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
  if (!res.ok) {
    throw new Error("Could not look up PIN code. Try again.");
  }

  const data = (await res.json()) as PincodeApiRow[];
  const row = data[0];
  if (!row || row.Status !== "Success" || !row.PostOffice?.length) {
    throw new Error("PIN code not found. Check the number and try again.");
  }

  return row.PostOffice;
}
