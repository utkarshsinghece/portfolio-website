import { motion } from "framer-motion";
import { ArrowDown, MapPin, Mail, Phone, Download } from "lucide-react";
import { useState } from "react";
import { generateResumePDF } from "@/lib/resume-pdf";
import { toast } from "sonner";
import { SocialLinks, type SocialProfile } from "./SocialLinks";
import profilePhoto from "@/assets/profile-photo.png";
import { Typewriter } from "./Typewriter";
import { AnimatedCounter } from "./AnimatedCounter";

interface Stat { value: string; label: string }
interface Profile extends SocialProfile {
  name: string;
  title: string;
  tagline: string;
  email: string;
  phone: string;
  location: string;
  availability?: string;
  stats?: Stat[] | null;
  show_hire_me?: boolean;
  show_resume?: boolean;
  show_email?: boolean;
  show_phone?: boolean;
}

export function Hero({ profile }: { profile: Profile }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await generateResumePDF();
      toast.success("Resume downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Could not generate resume. Try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32 grain">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[600px]"
        style={{ background: "var(--gradient-hero)" }}
      />
      {/* grid */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse 60% 60% at 50% 30%, black, transparent 80%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-lime" />
            </span>
            {profile.availability || "Available for Senior Data Roles / Staff Data Roles"}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-8 relative"
          >
            <div className="absolute inset-0 -z-10 rounded-full blur-2xl opacity-60" style={{ background: "var(--gradient-hero)" }} />
            <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full overflow-hidden ring-2 ring-lime/40 ring-offset-4 ring-offset-background shadow-2xl">
              <img src={profilePhoto} alt={`${profile.name} portrait`} className="h-full w-full object-cover" />
            </div>
          </motion.div>

          <h1 className="mt-8 font-display text-5xl sm:text-7xl lg:text-8xl font-semibold leading-[0.95] text-gradient">
            {profile.name.split(" ")[0]}
            <br />
            <span className="text-lime-gradient">{profile.name.split(" ").slice(1).join(" ")}</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg sm:text-xl text-muted-foreground font-light min-h-[1.75em]">
            <Typewriter
              words={[
                "Senior Data Engineer",
                "Pipeline Architect",
                "PySpark · Snowflake · Airflow",
                "Builder of $600M+ data products",
              ]}
              className="text-foreground/90"
            />
          </p>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground/80">
            {profile.tagline}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 glass rounded-full px-3 py-1.5">
              <MapPin className="h-3.5 w-3.5 text-lime" /> {profile.location}
            </span>
            {profile.show_email && (
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-1.5 glass rounded-full px-3 py-1.5 hover:text-foreground transition"
              >
                <Mail className="h-3.5 w-3.5 text-lime" /> {profile.email}
              </a>
            )}
            {profile.show_phone && (
              <a
                href={`tel:${profile.phone}`}
                className="inline-flex items-center gap-1.5 glass rounded-full px-3 py-1.5 hover:text-foreground transition"
              >
                <Phone className="h-3.5 w-3.5 text-lime" /> {profile.phone}
              </a>
            )}
          </div>

          <SocialLinks profile={profile} variant="pill" className="mt-4 justify-center" />

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a href="#experience" className="btn-cred group">
              See my work
              <ArrowDown className="h-4 w-4 transition group-hover:translate-y-0.5" />
            </a>
            <a href="#contact" className="btn-cred-dark">
              Get in touch
            </a>
            {profile.show_resume && (
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="btn-cred-dark disabled:opacity-60"
              >
                <Download className="h-4 w-4" />
                {downloading ? "Generating…" : "Download Resume"}
              </button>
            )}
          </div>

          {/* Stats strip */}
          <div className="mt-16 grid w-full grid-cols-2 sm:grid-cols-4 gap-4">
            {(profile.stats && profile.stats.length
              ? profile.stats
              : [
                  { value: "4+", label: "Years experience" },
                  { value: "$600M+", label: "Revenue powered" },
                  { value: "90%", label: "Faster pipelines" },
                  { value: "200+", label: "Teams enabled" },
                ]
            ).map((s, i) => (
              <div key={`${s.label}-${i}`} className="gradient-card rounded-2xl p-4 sm:p-5">
                <div className="font-display text-2xl sm:text-3xl font-semibold text-lime-gradient">
                  <AnimatedCounter value={s.value} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
