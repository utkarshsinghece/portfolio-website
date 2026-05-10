import { motion } from "framer-motion";
import { Building2, Calendar, MapPin } from "lucide-react";
import { getSkillIcon, getSkillColor, getSkillLabel } from "@/lib/skill-icons";

export interface Highlight {
  metric: string;
  text: string;
}
export interface ExpItem {
  id: string;
  company: string;
  role: string;
  location: string;
  period: string;
  highlights: Highlight[];
  tech_stack?: string[];
  logo_url?: string | null;
}

export function Experience({ items }: { items: ExpItem[] }) {
  return (
    <section id="experience" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/70">
          03 / Experience
        </p>
        <h2 className="mt-4 font-display text-4xl sm:text-5xl font-semibold text-gradient max-w-3xl">
          Pipelines shipped. Numbers moved.
        </h2>

        <div className="relative mt-14">
          <div className="absolute left-4 sm:left-6 top-2 bottom-2 w-px bg-gradient-to-b from-foreground/40 via-border to-transparent" />

          <div className="space-y-10">
            {items.map((item, i) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="relative pl-12 sm:pl-20"
              >
                <div className="absolute left-0 top-2 sm:left-2 grid h-8 w-8 place-items-center rounded-full bg-foreground text-background overflow-hidden">
                  {item.logo_url ? (
                    <img src={item.logo_url} alt={`${item.company} logo`} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <Building2 className="h-4 w-4" />
                  )}
                </div>

                <div className="gradient-card rounded-3xl p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.logo_url && (
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-elevated border border-border/60 overflow-hidden">
                          <img src={item.logo_url} alt={`${item.company} logo`} className="h-full w-full object-contain p-1" loading="lazy" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-display text-2xl sm:text-3xl font-semibold truncate">
                          {item.company}
                        </h3>
                        <p className="mt-1 text-foreground/80 font-medium">{item.role}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" /> {item.period}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" /> {item.location}
                      </span>
                    </div>
                  </div>

                  {item.tech_stack && item.tech_stack.length > 0 && (
                    <div className="mt-5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Tech Stack</p>
                      <div className="flex flex-wrap gap-2">
                        {item.tech_stack.map((key) => {
                          const Icon = getSkillIcon(key);
                          const color = getSkillColor(key);
                          return (
                            <span
                              key={key}
                              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-surface-elevated/70 px-2.5 py-1 text-[11px] font-mono text-foreground/90 hover:bg-surface-elevated transition"
                              title={getSkillLabel(key)}
                            >
                              <Icon className="h-3.5 w-3.5" style={color ? { color } : undefined} />
                              {getSkillLabel(key)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <ol className="mt-6 space-y-3">
                    {item.highlights.map((h, idx) => (
                      <li
                        key={idx}
                        className="group flex gap-4 rounded-2xl border border-border/40 bg-surface-elevated/40 p-4 transition hover:border-foreground/30 hover:bg-surface-elevated/70"
                      >
                        <div className="shrink-0 flex flex-col items-center gap-2">
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <div className="grid min-w-[64px] place-items-center rounded-xl bg-foreground/10 px-2 py-2 ring-1 ring-foreground/30">
                            <span className="font-display text-base font-bold text-gradient leading-tight text-center">
                              {h.metric}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm sm:text-[15px] text-foreground/90 leading-relaxed self-center">
                          {h.text}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
