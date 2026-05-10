import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Skills } from "@/components/Skills";
import { Experience, type ExpItem } from "@/components/Experience";
import { Education } from "@/components/Education";
import { Contact } from "@/components/Contact";
import { TechBackdrop } from "@/components/TechBackdrop";
import { useAuth } from "@/hooks/useAuth";
import { isPreviewUrl, mergeDraft, previewList, type Draftable } from "@/lib/draft-merge";

interface ProfileRow {
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
  availability?: string;
  stats?: { value: string; label: string }[] | null;
  show_hire_me?: boolean;
  show_resume?: boolean;
  show_email?: boolean;
  show_phone?: boolean;
}

function App() {
  const { isAdmin } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [exp, setExp] = useState<ExpItem[]>([]);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const preview = isPreviewUrl() && isAdmin;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profile")
          .select("*")
          .eq("id", 1)
          .maybeSingle();
        if (error) throw error;
        if (!data) return;
        setProfile(preview ? mergeDraft(data as Draftable<ProfileRow>) : (data as ProfileRow));
      } catch (error) {
        console.error("Error loading profile:", error);
        // Set fallback data if Supabase fails
        setProfile({
          name: "Utkarsh Singh",
          title: "Senior Data Engineer",
          tagline: "Building scalable data pipelines",
          about: "Experienced data engineer with expertise in Spark, Kafka, and cloud technologies.",
          email: "sutkarsh28@gmail.com",
          phone: "+1-234-567-8900",
          location: "San Francisco, CA",
          linkedin: null,
          github: null,
          instagram: null,
          youtube: null,
          twitter: null,
          website: null,
          availability: "Available for opportunities",
          stats: [
            { value: "4+", label: "Years experience" },
            { value: "$600M+", label: "Revenue powered" },
            { value: "90%", label: "Faster pipelines" },
            { value: "200+", label: "Teams enabled" }
          ],
          show_hire_me: false,
          show_resume: false,
          show_email: false,
          show_phone: false
        });
      }
    };

    const loadExperience = async () => {
      try {
        let expQ = supabase.from("experience").select("*").order("sort_order", { ascending: true });
        if (!preview) expQ = expQ.eq("is_published", true);
        const { data, error } = await expQ;
        if (error) throw error;
        if (!data) return;
        setExp(
          preview
            ? (previewList(data as unknown as Draftable<ExpItem>[]) as unknown as ExpItem[])
            : (data as unknown as ExpItem[]),
        );
      } catch (error) {
        console.error("Error loading experience:", error);
        // Set empty experience if Supabase fails
        setExp([]);
      }
    };

    loadProfile();
    loadExperience();
  }, [preview]);

  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="font-mono text-xs text-muted-foreground">loading…</div>
      </div>
    );
  }

  // Simple routing based on current path
  if (currentPath === '/auth') {
    const AuthPage = () => {
      const [step, setStep] = useState<"password" | "otp">("password");
      const [password, setPassword] = useState("");
      const [otp, setOtp] = useState("");
      const [loading, setLoading] = useState(false);

      const verifyPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
          const { error: pwErr } = await supabase.auth.signInWithPassword({
            email: "sutkarsh28@gmail.com",
            password,
          });
          if (pwErr) throw pwErr;
          await supabase.auth.signOut();
          const { error: otpErr } = await supabase.auth.signInWithOtp({
            email: "sutkarsh28@gmail.com",
            options: { shouldCreateUser: false },
          });
          if (otpErr) throw otpErr;
          alert("Code sent to your email");
          setStep("otp");
        } catch (err) {
          alert(err instanceof Error ? err.message : "Invalid credentials");
        } finally {
          setLoading(false);
        }
      };

      const verifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
          const { error } = await supabase.auth.verifyOtp({
            email: "sutkarsh28@gmail.com",
            token: otp.trim(),
            type: "email",
          });
          if (error) throw error;
          window.location.href = "/admin";
        } catch (err) {
          alert(err instanceof Error ? err.message : "Invalid code");
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="min-h-screen grid place-items-center px-6">
          <div className="w-full max-w-md">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-6"
            >
              ← back
            </a>
            <div className="gradient-card rounded-3xl p-8">
              <h1 className="mt-5 font-display text-3xl font-semibold">
                {step === "password" ? "Owner sign in" : "Enter verification code"}
              </h1>
              {step === "password" ? (
                <form onSubmit={verifyPassword} className="mt-6 space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-muted-foreground">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoFocus
                      className="mt-1.5 w-full rounded-xl bg-input/50 border border-border px-4 py-3 text-sm outline-none focus:border-lime/60 focus:ring-2 focus:ring-lime/20 transition"
                      placeholder="••••••••"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-lime py-3 text-sm font-semibold text-lime-foreground hover:scale-[1.01] transition disabled:opacity-60"
                  >
                    {loading ? "Verifying..." : "Continue"}
                  </button>
                </form>
              ) : (
                <form onSubmit={verifyOtp} className="mt-6 space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-muted-foreground">
                      6-digit code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      autoFocus
                      className="mt-1.5 w-full rounded-xl bg-input/50 border border-border px-4 py-3 text-center text-lg tracking-[0.5em] font-mono outline-none focus:border-lime/60 focus:ring-2 focus:ring-lime/20 transition"
                      placeholder="······"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full rounded-xl bg-lime py-3 text-sm font-semibold text-lime-foreground hover:scale-[1.01] transition disabled:opacity-60"
                  >
                    {loading ? "Verifying..." : "Verify & sign in"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("password");
                      setOtp("");
                    }}
                    className="w-full text-xs text-muted-foreground hover:text-foreground transition"
                  >
                    ← Use a different password
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      );
    };
    return <AuthPage />;
  }

  if (currentPath === '/admin') {
    const AdminPage = () => {
      const { user, isAdmin, loading, signOut } = useAuth();
      
      if (loading) {
        return (
          <div className="min-h-screen grid place-items-center">
            <div className="font-mono text-xs text-muted-foreground">loading…</div>
          </div>
        );
      }

      if (!user || !isAdmin) {
        window.location.href = "/auth";
        return null;
      }

      return (
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <button
                onClick={signOut}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Sign Out
              </button>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Admin functionality coming soon...</p>
            </div>
          </div>
        </div>
      );
    };
    return <AdminPage />;
  }

  // Default home page
  return (
    <div className="relative min-h-screen">
      <TechBackdrop />
      <Nav showHireMe={!!profile.show_hire_me} />
      <main>
        <Hero profile={profile} />
        <About about={profile.about} />
        <Skills preview={preview} />
        <Experience items={exp} />
        <Education preview={preview} />
        <Contact profile={profile} />
      </main>
    </div>
  );
}

export default App;
