import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { galleryImages, media } from "@/lib/catalog";
import { apiFetch } from "@/lib/api";
import { formatContactAddress, useSiteSettings } from "@/lib/use-site-settings";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | Twinklingz" },
      {
        name: "description",
        content: "For order and product enquiries, please use the contact details configured by the Twinklingz team.",
      },
      { property: "og:title", content: "Contact Us | Twinklingz" },
      {
        property: "og:description",
        content: "For order and product enquiries, please use the contact details configured by the Twinklingz team.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: settings } = useSiteSettings();
  const contact = settings.contact;
  const address = formatContactAddress(contact);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      await apiFetch("/submissions", {
        method: "POST",
        body: JSON.stringify({
          type: "contact",
          name,
          email,
          phone,
          message,
          sourcePath: "/contact",
        }),
      });
      toast.success("Message sent — we will get back to you soon.");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send message");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-5 pb-24 pt-40">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-start">
        <div>
          <p className="text-xs font-semibold tracking-[.24em] text-accent">TWINKLINGZ</p>
          <h1 className="mt-4 font-display text-5xl sm:text-7xl">Contact Us</h1>
          <p className="mt-6 font-display text-2xl text-primary">We would love to hear from you.</p>
          {(contact.email || contact.phone || address) && (
            <div className="mt-6 space-y-2 text-sm leading-7 text-muted-foreground">
              {contact.email && (
                <p>
                  Email:{" "}
                  <a href={`mailto:${contact.email}`} className="text-foreground underline">
                    {contact.email}
                  </a>
                </p>
              )}
              {contact.phone && <p>Phone: {contact.phone}</p>}
              {contact.whatsapp && <p>WhatsApp: {contact.whatsapp}</p>}
              {address && <p className="whitespace-pre-line">{address}</p>}
            </div>
          )}
          <form className="mt-10 grid gap-4" onSubmit={onSubmit}>
            <input
              required
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-input bg-background p-4 outline-none focus:border-primary"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-input bg-background p-4 outline-none focus:border-primary"
            />
            <input
              placeholder="Mobile (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border border-input bg-background p-4 outline-none focus:border-primary"
            />
            <textarea
              required
              placeholder="Your message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="border border-input bg-background p-4 outline-none focus:border-primary"
            />
            <Button type="submit" disabled={sending}>
              {sending ? "Sending…" : "Send a message"}
            </Button>
          </form>
        </div>
        <img
          src={media.campaignImage}
          alt="Twinklingz jewellery"
          className="aspect-[4/5] w-full object-cover"
        />
      </div>
      <div className="mx-auto mt-16 grid max-w-6xl grid-cols-3 gap-2 sm:grid-cols-6">
        {galleryImages.slice(0, 6).map((src, i) => (
          <img key={src} src={src} alt={`Catalogue ${i + 1}`} loading="lazy" className="aspect-square object-cover" />
        ))}
      </div>
    </main>
  );
}
