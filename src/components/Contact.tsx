import { Mail, Phone, MapPin, Send, Loader2, LogIn, LogOut, Shield } from "lucide-react";
import { useRef, useState } from "react";
import { z } from "zod";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { SocialLinks, type SocialProfile } from "./SocialLinks";

function FooterAdminLink() {
  const { user, isAdmin, signOut } = useAuth();
  return (
    <span className="flex items-center gap-2">
      <span className="opacity-50">·</span>
      {isAdmin && (
        <Link to="/admin" className="inline-flex items-center gap-1 hover:text-foreground transition">
          <Shield className="h-3 w-3" /> admin panel
        </Link>
      )}
      {user ? (
        <button onClick={signOut} className="inline-flex items-center gap-1 hover:text-foreground transition">
          <LogOut className="h-3 w-3" /> sign out
        </button>
      ) : (
        <Link to="/auth" className="inline-flex items-center gap-1 hover:text-foreground transition">
          <LogIn className="h-3 w-3" /> login as admin
        </Link>
      )}
    </span>
  );
}

interface Profile extends SocialProfile {
  email: string;
  phone: string;
  location: string;
  show_email?: boolean;
  show_phone?: boolean;
}

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(5, "Message too short").max(2000),
});

export function Contact({ profile }: { profile: Profile }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const honeypot = useRef("");
  const mountedAt = useRef(Date.now());

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Spam protection: honeypot + min-time
    if (honeypot.current) return;
    if (Date.now() - mountedAt.current < 2500) {
      toast.error("Please take a moment to fill the form.");
      return;
    }

    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
    });
    setLoading(false);

    if (error) {
      toast.error("Could not send. Please try again.");
      return;
    }
    toast.success("Message sent. I'll get back to you soon.");
    setForm({ name: "", email: "", subject: "", message: "" });
    mountedAt.current = Date.now();
  };

  return (
    <section id="contact" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-border/60 p-6 sm:p-12">
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 80% 100% at 50% 0%, color-mix(in oklab, white 10%, transparent), transparent 70%), var(--gradient-card)",
            }}
          />

          <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/70">
            05 / Contact
          </p>
          <h2 className="mt-4 font-display text-3xl sm:text-5xl lg:text-6xl font-semibold text-gradient max-w-3xl">
            Let's build something that scales.
          </h2>
          <p className="mt-5 max-w-xl text-muted-foreground text-base sm:text-lg">
            Open to senior data engineering roles, consulting, and interesting data infra problems.
          </p>

          <div className="mt-10 grid lg:grid-cols-5 gap-6 lg:gap-8">
            {/* Info cards */}
            <div className="lg:col-span-2 space-y-3">
              {profile.show_email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="group flex items-start gap-3 rounded-2xl border border-border/60 bg-surface/50 p-4 sm:p-5 transition hover:border-foreground/30 hover:bg-surface"
                >
                  <Mail className="h-5 w-5 mt-0.5 text-foreground/80" />
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Email</div>
                    <div className="mt-1 truncate text-sm sm:text-base font-medium">{profile.email}</div>
                  </div>
                </a>
              )}
              {profile.show_phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="group flex items-start gap-3 rounded-2xl border border-border/60 bg-surface/50 p-4 sm:p-5 transition hover:border-foreground/30 hover:bg-surface"
                >
                  <Phone className="h-5 w-5 mt-0.5 text-foreground/80" />
                  <div>
                    <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Phone</div>
                    <div className="mt-1 text-sm sm:text-base font-medium">{profile.phone}</div>
                  </div>
                </a>
              )}
              <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-surface/50 p-4 sm:p-5">
                <MapPin className="h-5 w-5 mt-0.5 text-foreground/80" />
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Based in</div>
                  <div className="mt-1 text-sm sm:text-base font-medium">{profile.location}</div>
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-surface/50 p-4 sm:p-5">
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Connect</div>
                <SocialLinks profile={profile} variant="icon" />
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={onSubmit}
              className="lg:col-span-3 rounded-3xl border border-border/60 bg-surface/40 p-5 sm:p-7 space-y-4"
            >
              {/* honeypot */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                onChange={(e) => (honeypot.current = e.target.value)}
                className="hidden"
                aria-hidden
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  placeholder="Jane Doe"
                />
                <Input
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                  placeholder="jane@company.com"
                />
              </div>
              <Input
                label="Subject"
                value={form.subject}
                onChange={(v) => setForm({ ...form, subject: v })}
                placeholder="Optional — what's this about?"
              />
              <div>
                <label className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Message
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  maxLength={2000}
                  placeholder="Tell me about the problem, team, or opportunity…"
                  className="mt-1.5 w-full rounded-xl bg-input/40 border border-border/70 px-3.5 py-2.5 text-sm focus:border-foreground/40 outline-none resize-none transition"
                />
                <div className="mt-1 text-right text-[10px] text-muted-foreground font-mono">
                  {form.message.length}/2000
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-cred w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {loading ? "Sending…" : "Send message"}
              </button>
            </form>
          </div>
        </div>

        <footer className="mt-12 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Utkarsh Singh.</span>
          <FooterAdminLink />
        </footer>
      </div>
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl bg-input/40 border border-border/70 px-3.5 py-2.5 text-sm focus:border-foreground/40 outline-none transition"
      />
    </div>
  );
}
