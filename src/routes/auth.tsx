import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Lock, KeyRound } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

const OWNER_EMAIL = "sutkarsh28@gmail.com";

function AuthPage() {
  const nav = useNavigate();
  const [step, setStep] = useState<"password" | "otp">("password");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyPassword = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Step 1: verify password
      const { error: pwErr } = await supabase.auth.signInWithPassword({
        email: OWNER_EMAIL,
        password,
      });
      if (pwErr) throw pwErr;

      // Sign out immediately — password alone is not enough
      await supabase.auth.signOut();

      // Step 2: send email OTP as second factor
      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email: OWNER_EMAIL,
        options: { shouldCreateUser: false },
      });
      if (otpErr) throw otpErr;

      toast.success("Code sent to your email");
      setStep("otp");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: OWNER_EMAIL,
        token: otp.trim(),
        type: "email",
      });
      if (error) throw error;
      toast.success("Welcome back");
      nav({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> back
        </Link>

        <div className="gradient-card rounded-3xl p-8">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-lime/10 ring-1 ring-lime/30">
            {step === "password" ? (
              <Lock className="h-5 w-5 text-lime" />
            ) : (
              <KeyRound className="h-5 w-5 text-lime" />
            )}
          </div>
          <h1 className="mt-5 font-display text-3xl font-semibold">
            {step === "password" ? "Owner sign in" : "Enter verification code"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {step === "password"
              ? "Restricted to the site owner. Password + email code required."
              : `We sent a 6-digit code to ${OWNER_EMAIL}.`}
          </p>

          {step === "password" ? (
            <form onSubmit={verifyPassword} className="mt-6 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  value={OWNER_EMAIL}
                  disabled
                  className="mt-1.5 w-full rounded-xl bg-input/30 border border-border px-4 py-3 text-sm text-muted-foreground cursor-not-allowed"
                />
              </div>
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

          <p className="mt-6 text-[11px] text-muted-foreground/80 leading-relaxed">
            Only the owner account can access the admin panel. New signups are disabled.
          </p>
        </div>
      </div>
    </div>
  );
}
