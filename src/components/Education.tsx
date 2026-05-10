import { GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { previewList, type Draftable } from "@/lib/draft-merge";

interface EduRow {
  id: string;
  institution: string;
  degree: string;
  location: string;
  period: string;
  sort_order: number;
}

export function Education({ preview = false }: { preview?: boolean }) {
  const [items, setItems] = useState<EduRow[]>([]);

  useEffect(() => {
    let q = supabase.from("education").select("*").order("sort_order");
    if (!preview) q = q.eq("is_published", true);
    q.then(({ data }) => {
      if (!data) return;
      setItems(preview ? previewList(data as Draftable<EduRow>[]) : (data as EduRow[]));
    });
  }, [preview]);

  if (items.length === 0) return null;

  return (
    <section id="education" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/70">
          04 / Education
        </p>
        <h2 className="mt-4 font-display text-4xl sm:text-5xl font-semibold text-gradient">
          Foundations.
        </h2>

        <div className="mt-10 space-y-4">
          {items.map((e) => (
            <div key={e.id} className="gradient-card rounded-3xl p-6 sm:p-8 flex items-start gap-5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-foreground/10 ring-1 ring-foreground/20">
                <GraduationCap className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-semibold">{e.institution}</h3>
                <p className="mt-1 text-muted-foreground">
                  {e.degree}
                  {e.location ? ` · ${e.location}` : ""}
                </p>
                {e.period && (
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{e.period}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
