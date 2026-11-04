import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch, apiUploadForm, type PublicSiteSettings } from "@/lib/api";
import { LazyImage } from "@/components/ui/lazy-image";
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
        <p className="mt-2 text-muted-foreground">
          Homepage media, seasonal campaigns, contact, and brand copy. Uploads go to Cloudinary and update the live site
          immediately.
        </p>
      </div>

      <div className="space-y-6">
        <h3 className="font-display text-2xl">Homepage hero video</h3>
        <p className="text-sm text-muted-foreground">
          Autoplay loop on the main banner. Use separate clips for desktop/tablet (768px+) and phones. MP4 recommended,
          under 40MB. If empty, the site uses the default videos in <code className="text-xs">/public</code>.
        </p>
        <HeroVideoUpload
          title="Hero video — desktop & tablet"
          uploadPath="/admin/settings/hero-video-desktop"
          videoUrl={form.heroVideoDesktop ?? ""}
          onUploaded={(url) => setForm({ ...form, heroVideoDesktop: url })}
          onClear={() => setForm({ ...form, heroVideoDesktop: "" })}
          token={token}
        />
        <HeroVideoUpload
          title="Hero video — mobile"
          uploadPath="/admin/settings/hero-video-mobile"
          videoUrl={form.heroVideoMobile ?? ""}
          onUploaded={(url) => setForm({ ...form, heroVideoMobile: url })}
          onClear={() => setForm({ ...form, heroVideoMobile: "" })}
          token={token}
          previewMaxWidth={280}
        />
      </div>

      <div className="space-y-6 border-t border-border pt-10">
        <h3 className="font-display text-2xl">Seasonal offer banner</h3>
        <p className="text-sm text-muted-foreground">
          Full-width promo image below the hero (Diwali, festive sales, etc.). Swap anytime for a new season — desktop and
          mobile can differ.
        </p>
        <OfferBannerUpload
          title="Offer banner — desktop & tablet"
          description="Landscape artwork from 768px and up."
          uploadPath="/admin/settings/offer-banner"
          imageUrl={form.offerBannerImage ?? ""}
          onUploaded={(url) => setForm({ ...form, offerBannerImage: url })}
          onClear={() => setForm({ ...form, offerBannerImage: "" })}
          token={token}
        />
        <OfferBannerUpload
          title="Offer banner — mobile"
          description="Portrait or square for phones. Falls back to desktop if empty."
          uploadPath="/admin/settings/offer-banner-mobile"
          imageUrl={form.offerBannerImageMobile ?? ""}
          onUploaded={(url) => setForm({ ...form, offerBannerImageMobile: url })}
          onClear={() => setForm({ ...form, offerBannerImageMobile: "" })}
          token={token}
          previewMaxWidth={320}
        />
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
          <Label className="text-xs">Sales policy (all sales final)</Label>
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

function HeroVideoUpload({
  title,
  uploadPath,
  videoUrl,
  onUploaded,
  onClear,
  token,
  previewMaxWidth = 640,
}: {
  title: string;
  uploadPath: string;
  videoUrl: string;
  onUploaded: (url: string) => void;
  onClear: () => void;
  token: string | null;
  previewMaxWidth?: number;
}) {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("video", file);
      const res = await apiUploadForm<{ url: string; settings: PublicSiteSettings }>(uploadPath, fd, {
        token,
      });
      onUploaded(res.url);
      qc.invalidateQueries({ queryKey: ["public", "settings"] });
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
      toast.success("Hero video uploaded to Cloudinary");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <section className="space-y-4 border border-border bg-background p-6">
      <h4 className="font-display text-xl">{title}</h4>
      {videoUrl ? (
        <div className="mx-auto overflow-hidden border border-border bg-black" style={{ maxWidth: previewMaxWidth }}>
          <video src={videoUrl} muted playsInline loop autoPlay controls className="block h-auto w-full" />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No custom video — using site default.</p>
      )}
      <div className="flex flex-wrap gap-3">
        <Label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted">
          {uploading ? "Uploading…" : "Upload MP4 to Cloudinary"}
          <input
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            className="sr-only"
            disabled={uploading}
            onChange={onFileChange}
          />
        </Label>
        {videoUrl ? (
          <Button type="button" variant="outline" onClick={onClear}>
            Use default video
          </Button>
        ) : null}
      </div>
      <Field label="Or paste Cloudinary video URL" value={videoUrl} onChange={(v) => onUploaded(v)} />
    </section>
  );
}

function OfferBannerUpload({
  title,
  description,
  uploadPath,
  imageUrl,
  onUploaded,
  onClear,
  token,
  previewMaxWidth = 720,
}: {
  title: string;
  description: string;
  uploadPath: string;
  imageUrl: string;
  onUploaded: (url: string) => void;
  onClear: () => void;
  token: string | null;
  previewMaxWidth?: number;
}) {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await apiUploadForm<{ url: string; settings: PublicSiteSettings }>(uploadPath, fd, {
        token,
      });
      onUploaded(res.url);
      qc.invalidateQueries({ queryKey: ["public", "settings"] });
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
      toast.success("Offer banner uploaded to Cloudinary");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <section className="space-y-4 border border-border bg-background p-6">
      <h3 className="font-display text-xl">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      {imageUrl ? (
        <div
          className="mx-auto overflow-hidden border border-border bg-[#2a1510]"
          style={{ maxWidth: previewMaxWidth }}
        >
          <LazyImage src={imageUrl} alt="" optimizeWidth={1200} className="block h-auto w-full" />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No banner uploaded yet.</p>
      )}
      <div className="flex flex-wrap gap-3">
        <Label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted">
          {uploading ? "Uploading…" : "Upload to Cloudinary"}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploading} onChange={onFileChange} />
        </Label>
        {imageUrl ? (
          <Button type="button" variant="outline" onClick={onClear}>
            Remove banner URL
          </Button>
        ) : null}
      </div>
      <Field
        label="Or paste Cloudinary URL"
        value={imageUrl}
        onChange={(v) => onUploaded(v)}
      />
    </section>
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
