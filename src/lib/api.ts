const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "http://localhost:5000/api";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function parseJson(res: Response) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { error: text };
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
  const data = await parseJson(res);
  if (!res.ok) {
    throw new ApiError(String(data.error || res.statusText), res.status, data.details);
  }
  return data as T;
}

export function getApiBaseUrl() {
  return API_BASE;
}

export async function apiUploadForm<T>(
  path: string,
  formData: FormData,
  options: { token?: string | null; method?: string } = {},
): Promise<T> {
  const { token, method = "POST" } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await parseJson(res);
  if (!res.ok) {
    throw new ApiError(String(data.error || res.statusText), res.status, data.details);
  }
  return data as T;
}

export type PublicSiteSettings = {
  brandName: string;
  subBrand: string;
  tagline: string;
  announcementBar: string;
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pinCode: string;
    country: string;
  };
  social: { instagramHandle: string; instagramUrl: string };
  returnRefundPolicy: string;
  storyCopy: { headline: string; body: string; highlight: string };
};

export type ApiProduct = {
  _id?: string;
  id?: string;
  slug: string;
  sku: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  mrp?: number;
  badge?: "NEW" | "BESTSELLER" | null;
  rating: number;
  reviews: number;
  image: string;
  altImage: string;
  images: string[];
  inStock?: boolean;
  featured?: boolean;
  published?: boolean;
};
