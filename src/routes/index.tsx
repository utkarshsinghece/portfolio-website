import { createFileRoute } from "@tanstack/react-router";
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

export const Route = createFileRoute("/")({
  component: Index,
});

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

function Index() {
  const { isAdmin } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [exp, setExp] = useState<ExpItem[]>([]);
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

  if (!profile) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="font-mono text-xs text-muted-foreground">loading…</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <TechBackdrop />
      {preview && <PreviewBanner />}
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

function PreviewBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-foreground text-background text-xs font-mono text-center py-1.5 shadow-lg">
      PREVIEW MODE · showing unpublished drafts ·{" "}
      <a href="/" className="underline hover:no-underline">
        exit
      </a>
    </div>
  );
}
