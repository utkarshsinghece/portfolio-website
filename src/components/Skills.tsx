import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getSkillIcon } from "@/lib/skill-icons";
import { previewList, type Draftable } from "@/lib/draft-merge";

interface SkillRow {
  id: string;
  group_title: string;
  name: string;
  icon_key: string;
  color: string;
  sort_order: number;
  group_order: number;
}

export function Skills({ preview = false }: { preview?: boolean }) {
  const [rows, setRows] = useState<SkillRow[]>([]);

  useEffect(() => {
    let q = supabase.from("skills").select("*").order("group_order").order("sort_order");
    if (!preview) q = q.eq("is_published", true);
    q.then(({ data }) => {
      if (!data) return;
      setRows(preview ? previewList(data as Draftable<SkillRow>[]) : (data as SkillRow[]));
    });
  }, [preview]);

  const groups = useMemo(() => {
    const map = new Map<string, { title: string; order: number; skills: SkillRow[] }>();
    for (const r of rows) {
      const g = map.get(r.group_title) ?? { title: r.group_title, order: r.group_order, skills: [] };
      g.skills.push(r);
      map.set(r.group_title, g);
    }
    return Array.from(map.values()).sort((a, b) => a.order - b.order);
  }, [rows]);

  return (
    <section id="skills" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/70">
              02 / Skills
            </p>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl font-semibold text-gradient">
              The toolkit.
            </h2>
          </div>
          <p className="max-w-md text-muted-foreground">
            Everything I reach for to design, ship and tune production data systems.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {groups.map((g, gi) => (
            <motion.div
              key={g.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: gi * 0.05 }}
              className="gradient-card rounded-3xl p-6"
            >
              <h3 className="font-display text-lg font-semibold">{g.title}</h3>
              <div className="mt-5 flex flex-wrap gap-2">
                {g.skills.map((s) => {
                  const Icon = getSkillIcon(s.icon_key);
                  return (
                    <div
                      key={s.id}
                      className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface-elevated/60 px-3 py-1.5 text-sm transition hover:border-foreground/30 hover:bg-surface-elevated hover:-translate-y-0.5"
                    >
                      <Icon className="h-4 w-4" style={{ color: s.color }} />
                      <span>{s.name}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
