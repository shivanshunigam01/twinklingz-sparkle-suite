import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch, type PublicSiteSettings } from "@/lib/api";
import { getAdminToken } from "@/lib/admin-auth";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Site settings | Twinklingz Admin" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const token = getAdminToken();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => apiFetch<{ settings: PublicSiteSettings & { _id?: string } }>("/admin/settings", { token }),
  });

  const [form, setForm] = useState<PublicSiteSettings | null>(null);

  useEffect(() => {
    if (data?.settings) setForm(data.settings);
  }, [data]);

  const save = useMutation({
    mutationFn: () => apiFetch("/admin/settings", { method: "PUT", body: JSON.stringify(form), token }),
    onSuccess: () => {
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
      qc.invalidateQueries({ queryKey: ["public", "settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading || !form) {
    return <p className="text-sm text-muted-foreground">Loading settings…</p>;
  }

  const c = form.contact;

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h2 className="font-display text-4xl">Site settings</h2>
        <p className="mt-2 text-muted-foreground">Contact address, announcement bar, and brand copy for the public site.</p>
      </div>

      <section className="space-y-4 border border-border bg-background p-6">
        <h3 className="font-display text-xl">Brand</h3>
        <Field label="Brand name" value={form.brandName} onChange={(v) => setForm({ ...form, brandName: v })} />
        <Field label="Sub-brand" value={form.subBrand} onChange={(v) => setForm({ ...form, subBrand: v })} />
        <Field label="Tagline" value={form.tagline} onChange={(v) => setForm({ ...form, tagline: v })} />
        <div>
          <Label className="text-xs">Announcement bar</Label>
          <Input
            className="mt-1"
            value={form.announcementBar}
            onChange={(e) => setForm({ ...form, announcementBar: e.target.value })}
          />
        </div>
      </section>

      <section className="space-y-4 border border-border bg-background p-6">
        <h3 className="font-display text-xl">Contact</h3>
        <Field label="Email" value={c.email} onChange={(v) => setForm({ ...form, contact: { ...c, email: v } })} />
        <Field label="Phone" value={c.phone} onChange={(v) => setForm({ ...form, contact: { ...c, phone: v } })} />
        <Field label="WhatsApp" value={c.whatsapp} onChange={(v) => setForm({ ...form, contact: { ...c, whatsapp: v } })} />
        <Field label="Address line 1" value={c.addressLine1} onChange={(v) => setForm({ ...form, contact: { ...c, addressLine1: v } })} />
        <Field label="Address line 2" value={c.addressLine2} onChange={(v) => setForm({ ...form, contact: { ...c, addressLine2: v } })} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="City" value={c.city} onChange={(v) => setForm({ ...form, contact: { ...c, city: v } })} />
          <Field label="State" value={c.state} onChange={(v) => setForm({ ...form, contact: { ...c, state: v } })} />
          <Field label="PIN" value={c.pinCode} onChange={(v) => setForm({ ...form, contact: { ...c, pinCode: v } })} />
        </div>
      </section>

      <section className="space-y-4 border border-border bg-background p-6">
        <h3 className="font-display text-xl">Social</h3>
        <Field
          label="Instagram handle"
          value={form.social.instagramHandle}
          onChange={(v) => setForm({ ...form, social: { ...form.social, instagramHandle: v } })}
        />
        <Field
          label="Instagram URL"
          value={form.social.instagramUrl}
          onChange={(v) => setForm({ ...form, social: { ...form.social, instagramUrl: v } })}
        />
      </section>

      <section className="space-y-4 border border-border bg-background p-6">
        <h3 className="font-display text-xl">Policies & story</h3>
        <div>
          <Label className="text-xs">Return / refund policy</Label>
          <Textarea
            className="mt-1 min-h-24"
            value={form.returnRefundPolicy}
            onChange={(e) => setForm({ ...form, returnRefundPolicy: e.target.value })}
          />
        </div>
        <Field
          label="Story headline"
          value={form.storyCopy.headline}
          onChange={(v) => setForm({ ...form, storyCopy: { ...form.storyCopy, headline: v } })}
        />
        <div>
          <Label className="text-xs">Story body</Label>
          <Textarea
            className="mt-1 min-h-32"
            value={form.storyCopy.body}
            onChange={(e) => setForm({ ...form, storyCopy: { ...form.storyCopy, body: e.target.value } })}
          />
        </div>
      </section>

      <Button onClick={() => save.mutate()} disabled={save.isPending}>
        Save all settings
      </Button>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input className="mt-1" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
