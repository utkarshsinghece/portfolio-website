import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ShieldAlert,
  Mail,
  MailOpen,
  Inbox,
  User,
  Briefcase,
  Sparkles,
  GraduationCap,
  LogOut,
  Search,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Eye,
  X,
  Building2,
  Calendar,
  MapPin,
  Send,
  CheckCircle2,
  CircleAlert,
  Loader2,
  ExternalLink,
  Cloud,
  CloudOff,
} from "lucide-react";
import { ICON_OPTIONS, getSkillIcon } from "@/lib/skill-icons";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAutosaveDraft, type SaveStatus } from "@/hooks/useAutosaveDraft";
import { mergeDraft, type Draftable } from "@/lib/draft-merge";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

interface HeroStat { value: string; label: string }
interface Profile {
  id: number;
  name: string;
  title: string;
  tagline: string;
  about: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string | null;
  github: string | null;
  instagram: string | null;
  youtube: string | null;
  twitter: string | null;
  website: string | null;
  availability: string;
  stats: HeroStat[];
  show_hire_me: boolean;
  show_resume: boolean;
  show_email: boolean;
  show_phone: boolean;
}

interface Highlight { metric: string; text: string }
interface Exp {
  id: string;
  company: string;
  role: string;
  location: string;
  period: string;
  sort_order: number;
  highlights: Highlight[];
  tech_stack: string[];
  logo_url: string | null;
  is_published?: boolean;
  pending_delete?: boolean;
}
interface ContactMsg {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}
interface Skill {
  id: string;
  group_title: string;
  name: string;
  icon_key: string;
  color: string;
  sort_order: number;
  group_order: number;
  is_published?: boolean;
  pending_delete?: boolean;
}
interface Edu {
  id: string;
  institution: string;
  degree: string;
  location: string;
  period: string;
  sort_order: number;
  is_published?: boolean;
  pending_delete?: boolean;
}

type Tab = "profile" | "skills" | "experience" | "education" | "contact" | "visibility";

interface PublishState {
  has_pending: boolean;
  last_published_at: string | null;
}

function AdminPage() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("profile");
  const [publishState, setPublishState] = useState<PublishState>({ has_pending: false, last_published_at: null });
  const [publishing, setPublishing] = useState(false);

  const reloadPublishState = useCallback(async () => {
    const { data } = await supabase
      .from("publish_state")
      .select("has_pending,last_published_at")
      .eq("id", 1)
      .maybeSingle();
    if (data) setPublishState(data as PublishState);
  }, []);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [user, loading, nav]);

  useEffect(() => {
    if (isAdmin) reloadPublishState();
  }, [isAdmin, reloadPublishState]);

  // Realtime: refresh when triggers flip has_pending
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel("publish-state")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "publish_state" },
        () => reloadPublishState(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, reloadPublishState]);

  const onPublish = async () => {
    if (!confirm("Publish all draft changes to the public site?")) return;
    setPublishing(true);
    const { error } = await supabase.rpc("publish_drafts");
    setPublishing(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Published to live site");
    reloadPublishState();
  };

  if (loading)
    return <div className="min-h-screen grid place-items-center text-muted-foreground">loading…</div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center px-6">
        <div className="gradient-card max-w-md w-full rounded-3xl p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 ring-1 ring-destructive/40">
            <ShieldAlert className="h-6 w-6 text-destructive" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold">Not an admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account ({user?.email}) doesn't have admin privileges.
          </p>
          <Link to="/" className="mt-6 inline-block text-xs hover:underline">
            ← back to portfolio
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; Icon: typeof Inbox }[] = [
    { id: "profile", label: "Profile", Icon: User },
    { id: "skills", label: "Skills", Icon: Sparkles },
    { id: "experience", label: "Experience", Icon: Briefcase },
    { id: "education", label: "Education", Icon: GraduationCap },
    { id: "contact", label: "Inbox", Icon: Inbox },
    { id: "visibility", label: "Visibility", Icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <Link to="/" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-foreground text-background font-display font-bold">
                U
              </Link>
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Admin Console
                </p>
                <p className="text-xs sm:text-sm truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PublishStatus state={publishState} />
              <a
                href="/?preview=1"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs hover:bg-surface transition"
                title="Open public site with your unpublished drafts merged in"
              >
                <Eye className="h-3.5 w-3.5" /> Preview
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
              <button
                onClick={onPublish}
                disabled={!publishState.has_pending || publishing}
                className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-1.5 text-xs font-semibold text-background hover:bg-foreground/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                {publishing ? "Publishing…" : "Publish"}
              </button>
              <button
                onClick={() => signOut()}
                title="Sign out"
                className="hidden sm:inline-flex items-center justify-center rounded-full border border-border/70 p-2 text-muted-foreground hover:text-foreground hover:bg-surface transition"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <nav className="-mb-px flex gap-1 overflow-x-auto scrollbar-none">
            {tabs.map(({ id, label, Icon }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`group inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-medium transition ${
                    active
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Tab content */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {tab === "profile" && <ProfileSection />}
        {tab === "skills" && <SkillsSection />}
        {tab === "experience" && <ExperienceSection />}
        {tab === "education" && <EducationSection />}
        {tab === "contact" && <InboxSection />}
        {tab === "visibility" && <VisibilitySection />}
      </main>
    </div>
  );
}

function PublishStatus({ state }: { state: PublishState }) {
  if (state.has_pending) {
    return (
      <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 text-amber-200 px-2.5 py-1 text-[11px] font-mono">
        <CloudOff className="h-3 w-3" /> unpublished changes
      </span>
    );
  }
  return (
    <span
      className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-300 px-2.5 py-1 text-[11px] font-mono"
      title={state.last_published_at ? `Last published ${new Date(state.last_published_at).toLocaleString()}` : undefined}
    >
      <Cloud className="h-3 w-3" /> all live
    </span>
  );
}

function SaveIndicator({ status, savedAt }: { status: SaveStatus; savedAt: Date | null }) {
  const [, force] = useState(0);
  // Re-render every 30s so "1 min ago" updates
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  if (status === "saving")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
        <Loader2 className="h-3 w-3 animate-spin" /> saving…
      </span>
    );
  if (status === "dirty")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-mono">
        <CircleAlert className="h-3 w-3" /> unsaved
      </span>
    );
  if (status === "error")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-destructive font-mono">
        <CircleAlert className="h-3 w-3" /> save failed
      </span>
    );
  if (status === "saved" && savedAt)
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-mono">
        <CheckCircle2 className="h-3 w-3" /> draft saved {timeAgo(savedAt)}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
      <Cloud className="h-3 w-3" /> draft
    </span>
  );
}

function timeAgo(d: Date) {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

/* ============================== INBOX ============================== */
function InboxSection() {
  const [messages, setMessages] = useState<ContactMsg[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  useEffect(() => {
    supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => data && setMessages(data as ContactMsg[]));
  }, []);

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      if (filter === "unread" && m.is_read) return false;
      if (filter === "read" && !m.is_read) return false;
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      return (
        m.name.toLowerCase().includes(s) ||
        m.email.toLowerCase().includes(s) ||
        (m.subject ?? "").toLowerCase().includes(s) ||
        m.message.toLowerCase().includes(s)
      );
    });
  }, [messages, q, filter]);

  const toggleRead = async (m: ContactMsg) => {
    const { error } = await supabase
      .from("contact_messages")
      .update({ is_read: !m.is_read })
      .eq("id", m.id);
    if (error) return toast.error(error.message);
    setMessages((p) => p.map((x) => (x.id === m.id ? { ...x, is_read: !m.is_read } : x)));
  };

  const deleteMsg = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setMessages((p) => p.filter((x) => x.id !== id));
    toast.success("Deleted");
  };

  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <SectionShell
      eyebrow="01 / Inbox"
      title="Messages"
      subtitle={`${messages.length} total · ${unread} unread`}
    >
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, subject…"
            className="w-full rounded-2xl bg-input/40 border border-border/70 pl-10 pr-4 py-2.5 text-sm focus:border-foreground/40 outline-none"
          />
        </div>
        <div className="inline-flex rounded-2xl border border-border/70 bg-input/30 p-1 text-xs">
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl capitalize transition ${
                filter === f ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty icon={Inbox} text="No messages match your filter." />
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <div
              key={m.id}
              className={`rounded-2xl border p-4 transition ${
                m.is_read ? "border-border/50 bg-surface/40" : "border-foreground/25 bg-surface-elevated/60"
              }`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{m.name}</span>
                    <a
                      href={`mailto:${m.email}`}
                      className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                    >
                      {m.email}
                    </a>
                    {!m.is_read && (
                      <span className="rounded-full bg-foreground text-background px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider">
                        new
                      </span>
                    )}
                  </div>
                  {m.subject && <div className="mt-1 text-sm font-medium">{m.subject}</div>}
                  <p className="mt-2 text-sm text-foreground/85 whitespace-pre-wrap break-words">
                    {m.message}
                  </p>
                  <div className="mt-2 font-mono text-[10px] text-muted-foreground">
                    {new Date(m.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <IconBtn title={m.is_read ? "Mark unread" : "Mark read"} onClick={() => toggleRead(m)}>
                    {m.is_read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                  </IconBtn>
                  <IconBtn title="Delete" danger onClick={() => deleteMsg(m.id)}>
                    <Trash2 className="h-4 w-4" />
                  </IconBtn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

/* ============================== PROFILE ============================== */
function ProfileSection() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("profile")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        const p = data as unknown as Profile;
        setProfile({
          ...p,
          availability: p.availability ?? "",
          stats: Array.isArray(p.stats) ? p.stats : [],
          show_hire_me: !!p.show_hire_me,
          show_resume: !!p.show_resume,
          show_email: !!p.show_email,
          show_phone: !!p.show_phone,
        });
      });
  }, []);

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profile")
      .update({
        name: profile.name,
        title: profile.title,
        tagline: profile.tagline,
        about: profile.about,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        linkedin: profile.linkedin,
        github: profile.github,
        instagram: profile.instagram,
        youtube: profile.youtube,
        twitter: profile.twitter,
        website: profile.website,
        availability: profile.availability,
        stats: profile.stats as unknown as never,
        show_hire_me: profile.show_hire_me,
        show_resume: profile.show_resume,
        show_email: profile.show_email,
        show_phone: profile.show_phone,
      })
      .eq("id", 1);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  };

  if (!profile) return <SectionShell eyebrow="02 / Profile" title="Profile"><Empty icon={User} text="Loading…" /></SectionShell>;

  return (
    <SectionShell
      eyebrow="02 / Profile"
      title="Profile"
      subtitle="Hero, about & contact details"
      action={<PrimaryBtn onClick={save} disabled={saving}><Save className="h-4 w-4" /> {saving ? "Saving…" : "Save"}</PrimaryBtn>}
    >
      <div className="space-y-5">
        <Card title="Identity">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Name" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} />
            <Field label="Title" value={profile.title} onChange={(v) => setProfile({ ...profile, title: v })} />
          </div>
          <Field label="Tagline" value={profile.tagline} onChange={(v) => setProfile({ ...profile, tagline: v })} />
          <Field label="About" multiline value={profile.about} onChange={(v) => setProfile({ ...profile, about: v })} />
        </Card>

        <Card title="Contact">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Email" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })} />
            <Field label="Phone" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} />
            <Field label="Location" value={profile.location} onChange={(v) => setProfile({ ...profile, location: v })} />
          </div>
        </Card>

        <Card title="Visibility · what shows on the public site">
          <p className="-mt-2 mb-3 text-xs text-muted-foreground">
            Toggle these on when you're actively looking. They're off by default so the site stays clean and your contact details stay private.
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            <Toggle
              label="Show 'Hire me' button (nav)"
              hint="Top-right CTA in the navbar"
              checked={profile.show_hire_me}
              onChange={(v) => setProfile({ ...profile, show_hire_me: v })}
            />
            <Toggle
              label="Show 'Download Resume' button"
              hint="Hero action button"
              checked={profile.show_resume}
              onChange={(v) => setProfile({ ...profile, show_resume: v })}
            />
            <Toggle
              label="Show email publicly"
              hint="Hero pill + contact card"
              checked={profile.show_email}
              onChange={(v) => setProfile({ ...profile, show_email: v })}
            />
            <Toggle
              label="Show phone publicly"
              hint="Hero pill + contact card"
              checked={profile.show_phone}
              onChange={(v) => setProfile({ ...profile, show_phone: v })}
            />
          </div>
        </Card>

        <Card title="Hero — Availability & Stats">
          <Field
            label="Availability pill text"
            value={profile.availability}
            onChange={(v) => setProfile({ ...profile, availability: v })}
          />
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Stats strip ({profile.stats.length})
              </span>
              <button
                type="button"
                onClick={() =>
                  setProfile({
                    ...profile,
                    stats: [...profile.stats, { value: "0", label: "New stat" }],
                  })
                }
                className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-surface px-2.5 py-1 text-xs hover:bg-foreground/10"
              >
                <Plus className="h-3 w-3" /> Add stat
              </button>
            </div>
            <div className="space-y-2">
              {profile.stats.map((s, i) => (
                <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-center">
                  <input
                    value={s.value}
                    onChange={(e) => {
                      const next = [...profile.stats];
                      next[i] = { ...next[i], value: e.target.value };
                      setProfile({ ...profile, stats: next });
                    }}
                    placeholder="Value (e.g. $600M+)"
                    className="rounded-lg border border-border/60 bg-input/40 px-3 py-2 text-sm font-display"
                  />
                  <input
                    value={s.label}
                    onChange={(e) => {
                      const next = [...profile.stats];
                      next[i] = { ...next[i], label: e.target.value };
                      setProfile({ ...profile, stats: next });
                    }}
                    placeholder="Label (e.g. Revenue powered)"
                    className="rounded-lg border border-border/60 bg-input/40 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setProfile({
                        ...profile,
                        stats: profile.stats.filter((_, idx) => idx !== i),
                      })
                    }
                    className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Remove stat"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Social links">
          <p className="-mt-2 mb-2 text-xs text-muted-foreground">
            Anything you fill in here appears as a clickable icon in the hero and the contact section.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="LinkedIn URL" value={profile.linkedin ?? ""} onChange={(v) => setProfile({ ...profile, linkedin: v })} />
            <Field label="GitHub URL" value={profile.github ?? ""} onChange={(v) => setProfile({ ...profile, github: v })} />
            <Field label="Twitter / X URL" value={profile.twitter ?? ""} onChange={(v) => setProfile({ ...profile, twitter: v })} />
            <Field label="Instagram URL" value={profile.instagram ?? ""} onChange={(v) => setProfile({ ...profile, instagram: v })} />
            <Field label="YouTube URL" value={profile.youtube ?? ""} onChange={(v) => setProfile({ ...profile, youtube: v })} />
            <Field label="Personal website URL" value={profile.website ?? ""} onChange={(v) => setProfile({ ...profile, website: v })} />
          </div>
        </Card>
      </div>
    </SectionShell>
  );
}

/* ============================== EXPERIENCE ============================== */
function ExperienceSection() {
  const [exps, setExps] = useState<Exp[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const reload = () =>
    supabase
      .from("experience")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        if (!data) return;
        const normalized = (data as unknown as Exp[]).map((e) => ({
          ...e,
          tech_stack: Array.isArray(e.tech_stack) ? e.tech_stack : [],
          highlights: Array.isArray(e.highlights) ? e.highlights : [],
          logo_url: e.logo_url ?? null,
        }));
        setExps(normalized);
      });

  useEffect(() => { reload(); }, []);

  const addExp = async () => {
    const sort_order = (exps[exps.length - 1]?.sort_order ?? 0) + 1;
    const { data, error } = await supabase
      .from("experience")
      .insert({
        company: "New Company",
        role: "New Role",
        location: "Location",
        period: "Year — Year",
        sort_order,
        highlights: [],
        tech_stack: [] as unknown as never,
      })
      .select()
      .single();
    if (error) return toast.error(error.message);
    if (data) {
      const e = { ...(data as unknown as Exp), tech_stack: [], highlights: [], logo_url: null };
      setExps((p) => [...p, e]);
      setOpenId(e.id);
      toast.success("Experience added");
    }
  };

  const saveExp = async (e: Exp) => {
    const { error } = await supabase
      .from("experience")
      .update({
        company: e.company,
        role: e.role,
        location: e.location,
        period: e.period,
        sort_order: e.sort_order,
        highlights: e.highlights as unknown as never,
        tech_stack: e.tech_stack as unknown as never,
        logo_url: e.logo_url,
      })
      .eq("id", e.id);
    if (error) toast.error(error.message);
    else toast.success(`${e.company} saved`);
  };

  const deleteExp = async (id: string) => {
    if (!confirm("Delete this experience?")) return;
    const { error } = await supabase.from("experience").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setExps((p) => p.filter((x) => x.id !== id));
    toast.success("Deleted");
  };

  const update = (id: string, patch: Partial<Exp>) =>
    setExps((p) => p.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = exps.findIndex((e) => e.id === active.id);
    const newIdx = exps.findIndex((e) => e.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const reordered = arrayMove(exps, oldIdx, newIdx).map((e, i) => ({ ...e, sort_order: i }));
    setExps(reordered);
    await Promise.all(
      reordered.map((e) =>
        supabase.from("experience").update({ sort_order: e.sort_order }).eq("id", e.id)
      )
    );
    toast.success("Timeline reordered");
  };

  const toggleTech = (id: string, key: string) => {
    setExps((p) =>
      p.map((e) => {
        if (e.id !== id) return e;
        const has = e.tech_stack.includes(key);
        return { ...e, tech_stack: has ? e.tech_stack.filter((k) => k !== key) : [...e.tech_stack, key] };
      })
    );
  };

  const previewExp = previewId ? exps.find((e) => e.id === previewId) : null;

  return (
    <SectionShell
      eyebrow="03 / Experience"
      title="Experience"
      subtitle={`${exps.length} role${exps.length === 1 ? "" : "s"} · drag to reorder`}
      action={<PrimaryBtn onClick={addExp}><Plus className="h-4 w-4" /> Add experience</PrimaryBtn>}
    >
      {exps.length === 0 ? (
        <Empty icon={Briefcase} text="No experience yet. Add your first role." />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={exps.map((e) => e.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {exps.map((e, i) => (
                <SortableExpRow
                  key={e.id}
                  exp={e}
                  index={i}
                  open={openId === e.id}
                  onToggle={() => setOpenId(openId === e.id ? null : e.id)}
                  onPreview={() => setPreviewId(e.id)}
                  onUpdate={(patch) => update(e.id, patch)}
                  onSave={() => saveExp(e)}
                  onDelete={() => deleteExp(e.id)}
                  onToggleTech={(k) => toggleTech(e.id, k)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {previewExp && (
        <PreviewModal title={`${previewExp.company} · live preview`} onClose={() => setPreviewId(null)}>
          <ExpPreviewCard exp={previewExp} />
        </PreviewModal>
      )}
    </SectionShell>
  );
}

function SortableExpRow({
  exp: e,
  index: i,
  open,
  onToggle,
  onPreview,
  onUpdate,
  onSave,
  onDelete,
  onToggleTech,
}: {
  exp: Exp;
  index: number;
  open: boolean;
  onToggle: () => void;
  onPreview: () => void;
  onUpdate: (patch: Partial<Exp>) => void;
  onSave: () => void;
  onDelete: () => void;
  onToggleTech: (key: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: e.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-2xl border border-border/60 bg-surface/40 overflow-hidden">
      <div className="flex items-center gap-2 p-4">
        <button
          {...attributes}
          {...listeners}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="font-mono text-[10px] text-muted-foreground w-6 text-right">{String(i + 1).padStart(2, "0")}</span>
        <button onClick={onToggle} className="min-w-0 flex-1 text-left">
          <div className="font-display text-base font-semibold truncate">{e.company}</div>
          <div className="text-xs text-muted-foreground truncate">{e.role} · {e.period}</div>
        </button>
        <IconBtn title="Preview" onClick={onPreview}><Eye className="h-4 w-4" /></IconBtn>
        <IconBtn title={open ? "Collapse" : "Edit"} onClick={onToggle}>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </IconBtn>
        <IconBtn title="Delete" danger onClick={onDelete}><Trash2 className="h-4 w-4" /></IconBtn>
      </div>

      {open && (
        <div className="px-4 pb-4 border-t border-border/50 pt-4 space-y-5">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Company" value={e.company} onChange={(v) => onUpdate({ company: v })} />
            <Field label="Role" value={e.role} onChange={(v) => onUpdate({ role: v })} />
            <Field label="Location" value={e.location} onChange={(v) => onUpdate({ location: v })} />
            <Field label="Period" value={e.period} onChange={(v) => onUpdate({ period: v })} />
          </div>

          <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
            <Field
              label="Company logo URL"
              value={e.logo_url ?? ""}
              onChange={(v) => onUpdate({ logo_url: v || null })}
            />
            {e.logo_url && (
              <span className="grid h-12 w-12 place-items-center rounded-xl border border-border/60 bg-surface overflow-hidden">
                <img src={e.logo_url} alt="logo preview" className="h-full w-full object-contain p-1" />
              </span>
            )}
          </div>

          {/* Tech stack picker */}
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              Tech stack ({e.tech_stack.length})
            </h4>
            {e.tech_stack.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {e.tech_stack.map((k) => {
                  const Icon = getSkillIcon(k);
                  return (
                    <span key={k} className="inline-flex items-center gap-1.5 rounded-full bg-foreground/10 border border-foreground/20 px-2.5 py-1 text-xs">
                      <Icon className="h-3.5 w-3.5" />
                      {k}
                      <button onClick={() => onToggleTech(k)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto rounded-xl border border-border/50 bg-input/20 p-2">
              {ICON_OPTIONS.filter((k) => !e.tech_stack.includes(k)).map((k) => {
                const Icon = getSkillIcon(k);
                return (
                  <button
                    key={k}
                    onClick={() => onToggleTech(k)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs hover:bg-foreground/10 transition"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {k}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Numbered highlights */}
          <div>
            <div className="flex items-center justify-between">
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Highlights ({e.highlights.length})
              </h4>
              <button
                onClick={() =>
                  onUpdate({ highlights: [...e.highlights, { metric: "0%", text: "New highlight" }] })
                }
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs hover:bg-secondary/70"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {e.highlights.map((h, j) => (
                <div key={j} className="flex gap-2 items-start">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-foreground text-background font-mono text-xs">
                    {String(j + 1).padStart(2, "0")}
                  </span>
                  <input
                    value={h.metric}
                    onChange={(ev) => {
                      const nh = [...e.highlights];
                      nh[j] = { ...nh[j], metric: ev.target.value };
                      onUpdate({ highlights: nh });
                    }}
                    placeholder="Metric"
                    className="w-24 rounded-lg bg-input/50 border border-border px-3 py-2 text-sm font-mono focus:border-foreground/40 outline-none"
                  />
                  <input
                    value={h.text}
                    onChange={(ev) => {
                      const nh = [...e.highlights];
                      nh[j] = { ...nh[j], text: ev.target.value };
                      onUpdate({ highlights: nh });
                    }}
                    placeholder="Description"
                    className="flex-1 rounded-lg bg-input/50 border border-border px-3 py-2 text-sm focus:border-foreground/40 outline-none"
                  />
                  <div className="flex flex-col gap-1">
                    <button
                      disabled={j === 0}
                      onClick={() => {
                        const nh = [...e.highlights];
                        [nh[j - 1], nh[j]] = [nh[j], nh[j - 1]];
                        onUpdate({ highlights: nh });
                      }}
                      className="rounded bg-secondary p-1 hover:bg-secondary/70 disabled:opacity-30"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      disabled={j === e.highlights.length - 1}
                      onClick={() => {
                        const nh = [...e.highlights];
                        [nh[j], nh[j + 1]] = [nh[j + 1], nh[j]];
                        onUpdate({ highlights: nh });
                      }}
                      className="rounded bg-secondary p-1 hover:bg-secondary/70 disabled:opacity-30"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => onUpdate({ highlights: e.highlights.filter((_, idx) => idx !== j) })}
                    className="rounded-lg bg-destructive/10 px-3 py-2 text-destructive hover:bg-destructive/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <PrimaryBtn onClick={onSave}><Save className="h-4 w-4" /> Save changes</PrimaryBtn>
        </div>
      )}
    </div>
  );
}

function ExpPreviewCard({ exp }: { exp: Exp }) {
  return (
    <div className="gradient-card rounded-3xl p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-semibold">{exp.company}</h3>
            <p className="mt-1 text-foreground/80 font-medium">{exp.role}</p>
          </div>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {exp.period}</span>
          <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {exp.location}</span>
        </div>
      </div>
      {exp.tech_stack.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {exp.tech_stack.map((k) => {
            const Icon = getSkillIcon(k);
            return (
              <span key={k} className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-surface-elevated/60 px-2.5 py-1 text-[11px] font-mono">
                <Icon className="h-3.5 w-3.5" /> {k}
              </span>
            );
          })}
        </div>
      )}
      <ol className="mt-6 space-y-3">
        {exp.highlights.map((h, idx) => (
          <li key={idx} className="flex gap-4 rounded-2xl border border-border/40 bg-surface-elevated/40 p-4">
            <div className="shrink-0 flex flex-col items-center gap-2">
              <span className="font-mono text-[10px] text-muted-foreground">{String(idx + 1).padStart(2, "0")}</span>
              <div className="grid min-w-[64px] place-items-center rounded-xl bg-foreground/10 px-2 py-2 ring-1 ring-foreground/30">
                <span className="font-display text-base font-bold text-gradient text-center">{h.metric}</span>
              </div>
            </div>
            <p className="text-sm text-foreground/90 self-center">{h.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ============================== SKILLS ============================== */
function SkillsSection() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newGroup, setNewGroup] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const reload = () =>
    supabase
      .from("skills")
      .select("*")
      .order("group_order")
      .order("sort_order")
      .then(({ data }) => data && setSkills(data as Skill[]));

  useEffect(() => { reload(); }, []);

  const grouped = useMemo(() => {
    const m = new Map<string, { title: string; order: number; items: Skill[] }>();
    skills.forEach((s) => {
      const g = m.get(s.group_title) ?? { title: s.group_title, order: s.group_order, items: [] };
      g.items.push(s);
      m.set(s.group_title, g);
    });
    return Array.from(m.values())
      .map((g) => ({ ...g, items: [...g.items].sort((a, b) => a.sort_order - b.sort_order) }))
      .sort((a, b) => a.order - b.order);
  }, [skills]);

  const addGroup = async () => {
    const title = newGroup.trim();
    if (!title) return;
    const order = (grouped[grouped.length - 1]?.order ?? -1) + 1;
    const { data, error } = await supabase
      .from("skills")
      .insert({ group_title: title, name: "New skill", icon_key: "sparkles", color: "#FFFFFF", group_order: order, sort_order: 0 })
      .select()
      .single();
    if (error) return toast.error(error.message);
    if (data) {
      setSkills((p) => [...p, data as Skill]);
      setNewGroup("");
      toast.success("Group added");
    }
  };

  const addSkill = async (group_title: string, group_order: number) => {
    const sibling = skills.filter((s) => s.group_title === group_title);
    const sort_order = (sibling[sibling.length - 1]?.sort_order ?? -1) + 1;
    const { data, error } = await supabase
      .from("skills")
      .insert({ group_title, group_order, name: "New skill", icon_key: "sparkles", color: "#FFFFFF", sort_order })
      .select()
      .single();
    if (error) return toast.error(error.message);
    if (data) setSkills((p) => [...p, data as Skill]);
  };

  const updateSkill = (id: string, patch: Partial<Skill>) =>
    setSkills((p) => p.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const saveSkill = async (s: Skill) => {
    const { error } = await supabase
      .from("skills")
      .update({ name: s.name, icon_key: s.icon_key, color: s.color, group_title: s.group_title })
      .eq("id", s.id);
    if (error) toast.error(error.message);
    else toast.success("Saved");
  };

  const deleteSkill = async (id: string) => {
    const { error } = await supabase.from("skills").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setSkills((p) => p.filter((s) => s.id !== id));
  };

  const deleteGroup = async (group_title: string) => {
    if (!confirm(`Delete entire group "${group_title}" and all its skills?`)) return;
    const { error } = await supabase.from("skills").delete().eq("group_title", group_title);
    if (error) return toast.error(error.message);
    setSkills((p) => p.filter((s) => s.group_title !== group_title));
    toast.success("Group deleted");
  };

  const moveGroup = async (idx: number, dir: -1 | 1) => {
    const next = arrayMove(grouped, idx, idx + dir);
    if (idx + dir < 0 || idx + dir >= grouped.length) return;
    const updates: Promise<unknown>[] = [];
    const updated = [...skills];
    next.forEach((g, i) => {
      g.items.forEach((s) => {
        const target = updated.find((x) => x.id === s.id);
        if (target) target.group_order = i;
        updates.push(Promise.resolve(supabase.from("skills").update({ group_order: i }).eq("id", s.id)));
      });
    });
    setSkills(updated);
    await Promise.all(updates);
    toast.success("Groups reordered");
  };

  const onSkillDragEnd = async (groupTitle: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const groupSkills = skills
      .filter((s) => s.group_title === groupTitle)
      .sort((a, b) => a.sort_order - b.sort_order);
    const oldIdx = groupSkills.findIndex((s) => s.id === active.id);
    const newIdx = groupSkills.findIndex((s) => s.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const reordered = arrayMove(groupSkills, oldIdx, newIdx);
    const updated = skills.map((s) => {
      if (s.group_title !== groupTitle) return s;
      const newPos = reordered.findIndex((r) => r.id === s.id);
      return { ...s, sort_order: newPos };
    });
    setSkills(updated);
    await Promise.all(
      reordered.map((s, i) => supabase.from("skills").update({ sort_order: i }).eq("id", s.id))
    );
  };

  return (
    <SectionShell
      eyebrow="04 / Skills"
      title="Skills"
      subtitle={`${skills.length} skills · ${grouped.length} groups · drag to reorder`}
      action={
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowPreview((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-2 text-xs hover:bg-surface"
          >
            <Eye className="h-3.5 w-3.5" /> {showPreview ? "Hide" : "Show"} preview
          </button>
          <input
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            placeholder="New group"
            className="rounded-xl bg-input/50 border border-border px-3 py-2 text-sm focus:border-foreground/40 outline-none"
          />
          <PrimaryBtn onClick={addGroup}><Plus className="h-4 w-4" /> Group</PrimaryBtn>
        </div>
      }
    >
      <div className={showPreview ? "grid gap-5 lg:grid-cols-2" : ""}>
        <div className="space-y-5">
          {grouped.map((g, gi) => (
            <Card key={g.title} title={g.title} action={
              <div className="flex gap-1">
                <IconBtn title="Move group up" onClick={() => moveGroup(gi, -1)} disabled={gi === 0}>
                  <ChevronUp className="h-3.5 w-3.5" />
                </IconBtn>
                <IconBtn title="Move group down" onClick={() => moveGroup(gi, 1)} disabled={gi === grouped.length - 1}>
                  <ChevronDown className="h-3.5 w-3.5" />
                </IconBtn>
                <button
                  onClick={() => addSkill(g.title, g.order)}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs hover:bg-secondary/70"
                >
                  <Plus className="h-3 w-3" /> Skill
                </button>
                <IconBtn title="Delete group" danger onClick={() => deleteGroup(g.title)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </IconBtn>
              </div>
            }>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => onSkillDragEnd(g.title, e)}>
                <SortableContext items={g.items.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {g.items.map((s) => (
                      <SortableSkillRow
                        key={s.id}
                        skill={s}
                        onUpdate={(patch) => updateSkill(s.id, patch)}
                        onSave={() => saveSkill(s)}
                        onDelete={() => deleteSkill(s.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </Card>
          ))}
        </div>

        {showPreview && (
          <div className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-border/60 bg-surface/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-sm font-semibold">Live preview</h3>
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">public site</span>
              </div>
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                {grouped.map((g) => (
                  <div key={g.title} className="gradient-card rounded-2xl p-4">
                    <h4 className="font-display text-base font-semibold">{g.title}</h4>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {g.items.map((s) => {
                        const Icon = getSkillIcon(s.icon_key);
                        return (
                          <div key={s.id} className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface-elevated/60 px-3 py-1.5 text-sm">
                            <Icon className="h-4 w-4" style={{ color: s.color }} />
                            <span>{s.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </SectionShell>
  );
}

function SortableSkillRow({
  skill: s,
  onUpdate,
  onSave,
  onDelete,
}: {
  skill: Skill;
  onUpdate: (patch: Partial<Skill>) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: s.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  const Icon = getSkillIcon(s.icon_key);

  return (
    <div ref={setNodeRef} style={style} className="flex flex-wrap items-center gap-2 rounded-xl border border-border/50 bg-input/20 p-2">
      <button
        {...attributes}
        {...listeners}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-elevated">
        <Icon className="h-4 w-4" style={{ color: s.color }} />
      </div>
      <input
        value={s.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
        className="flex-1 min-w-[140px] rounded-lg bg-input/40 border border-border/60 px-3 py-1.5 text-sm focus:border-foreground/40 outline-none"
      />
      <select
        value={s.icon_key}
        onChange={(e) => onUpdate({ icon_key: e.target.value })}
        className="rounded-lg bg-input/40 border border-border/60 px-2 py-1.5 text-xs focus:border-foreground/40 outline-none"
      >
        {ICON_OPTIONS.map((k) => <option key={k} value={k}>{k}</option>)}
      </select>
      <input
        type="color"
        value={s.color}
        onChange={(e) => onUpdate({ color: e.target.value })}
        className="h-8 w-10 rounded-lg border border-border/60 bg-transparent cursor-pointer"
      />
      <IconBtn title="Save" onClick={onSave}><Save className="h-3.5 w-3.5" /></IconBtn>
      <IconBtn title="Delete" danger onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></IconBtn>
    </div>
  );
}

function PreviewModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-background p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{title}</h3>
          <button onClick={onClose} className="rounded-lg bg-secondary p-2 hover:bg-secondary/70">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ============================== EDUCATION ============================== */
function EducationSection() {
  const [items, setItems] = useState<Edu[]>([]);

  useEffect(() => {
    supabase
      .from("education")
      .select("*")
      .order("sort_order")
      .then(({ data }) => data && setItems(data as Edu[]));
  }, []);

  const add = async () => {
    const sort_order = (items[items.length - 1]?.sort_order ?? -1) + 1;
    const { data, error } = await supabase
      .from("education")
      .insert({ institution: "New School", degree: "Degree", location: "", period: "", sort_order })
      .select()
      .single();
    if (error) return toast.error(error.message);
    if (data) setItems((p) => [...p, data as Edu]);
  };

  const update = (id: string, patch: Partial<Edu>) =>
    setItems((p) => p.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const save = async (e: Edu) => {
    const { error } = await supabase
      .from("education")
      .update({ institution: e.institution, degree: e.degree, location: e.location, period: e.period })
      .eq("id", e.id);
    if (error) toast.error(error.message);
    else toast.success("Saved");
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    const { error } = await supabase.from("education").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setItems((p) => p.filter((e) => e.id !== id));
  };

  return (
    <SectionShell
      eyebrow="05 / Education"
      title="Education"
      subtitle={`${items.length} entr${items.length === 1 ? "y" : "ies"}`}
      action={<PrimaryBtn onClick={add}><Plus className="h-4 w-4" /> Add education</PrimaryBtn>}
    >
      {items.length === 0 ? (
        <Empty icon={GraduationCap} text="No education entries yet." />
      ) : (
        <div className="space-y-3">
          {items.map((e) => (
            <Card key={e.id} title={e.institution} action={
              <div className="flex gap-1">
                <IconBtn title="Save" onClick={() => save(e)}><Save className="h-3.5 w-3.5" /></IconBtn>
                <IconBtn title="Delete" danger onClick={() => remove(e.id)}><Trash2 className="h-3.5 w-3.5" /></IconBtn>
              </div>
            }>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Institution" value={e.institution} onChange={(v) => update(e.id, { institution: v })} />
                <Field label="Degree" value={e.degree} onChange={(v) => update(e.id, { degree: v })} />
                <Field label="Location" value={e.location} onChange={(v) => update(e.id, { location: v })} />
                <Field label="Period" value={e.period} onChange={(v) => update(e.id, { period: v })} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

/* ============================== UI ATOMS ============================== */
function SectionShell({
  eyebrow,
  title,
  subtitle,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="gradient-card rounded-3xl p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
          <h1 className="mt-1.5 font-display text-2xl sm:text-3xl font-semibold text-gradient">{title}</h1>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground font-mono">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface/40 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="font-display text-sm font-semibold">{title}</h3>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-xl bg-input/40 border border-border/60 px-3 py-2 text-sm focus:border-foreground/40 outline-none resize-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-xl bg-input/40 border border-border/60 px-3 py-2 text-sm focus:border-foreground/40 outline-none"
        />
      )}
    </div>
  );
}

function PrimaryBtn({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-xs sm:text-sm font-semibold text-background hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

function IconBtn({
  children,
  danger,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }) {
  return (
    <button
      {...props}
      className={`rounded-lg px-2.5 py-2 transition disabled:opacity-40 disabled:cursor-not-allowed ${
        danger
          ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
          : "bg-secondary hover:bg-secondary/70"
      }`}
    >
      {children}
    </button>
  );
}

function Empty({ icon: Icon, text }: { icon: typeof Inbox; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 bg-surface/30 p-10 text-center">
      <Icon className="mx-auto h-6 w-6 text-muted-foreground" />
      <p className="mt-3 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start justify-between gap-4 rounded-2xl border p-3.5 transition ${
        checked
          ? "border-foreground/40 bg-foreground/5"
          : "border-border/60 bg-surface/40 hover:border-foreground/20"
      }`}
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="mt-0.5 block text-[11px] text-muted-foreground">{hint}</span>}
      </span>
      <span
        role="switch"
        aria-checked={checked}
        className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${
          checked ? "bg-foreground" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-background shadow transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
