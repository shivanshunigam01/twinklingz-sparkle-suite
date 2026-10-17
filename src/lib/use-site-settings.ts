import { useQuery } from "@tanstack/react-query";
import { apiFetch, type PublicSiteSettings } from "@/lib/api";
import { ANNOUNCEMENT_BAR, BRAND, RETURN_REFUND_POLICY, SOCIAL, STORY_COPY } from "@/lib/cms-settings";

const fallback: PublicSiteSettings = {
  brandName: BRAND.name,
  subBrand: BRAND.subBrand,
  tagline: BRAND.tagline,
  announcementBar: ANNOUNCEMENT_BAR,
  contact: {
    email: "",
    phone: "",
    whatsapp: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pinCode: "",
    country: "India",
  },
  social: { ...SOCIAL },
  returnRefundPolicy: RETURN_REFUND_POLICY,
  storyCopy: { ...STORY_COPY },
};

export function useSiteSettings() {
  return useQuery({
    queryKey: ["public", "settings"],
    queryFn: async () => {
      try {
        const res = await apiFetch<{ settings: PublicSiteSettings }>("/settings");
        return res.settings;
      } catch {
        return fallback;
      }
    },
    staleTime: 60_000,
    initialData: fallback,
  });
}

export function formatContactAddress(contact: PublicSiteSettings["contact"]) {
  return [
    contact.addressLine1,
    contact.addressLine2,
    [contact.city, contact.state, contact.pinCode].filter(Boolean).join(", "),
    contact.country,
  ]
    .filter(Boolean)
    .join("\n");
}
