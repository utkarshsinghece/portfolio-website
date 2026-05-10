import { motion } from "framer-motion";

export function About({ about }: { about: string }) {
  return (
    <section id="about" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime">
            01 / About
          </p>
          <h2 className="mt-4 font-display text-4xl sm:text-5xl font-semibold text-gradient max-w-3xl">
            Data infrastructure that scales — and decisions that compound.
          </h2>
          <p className="mt-8 max-w-3xl text-lg text-muted-foreground leading-relaxed">
            {about}
          </p>

          <div className="mt-12 grid sm:grid-cols-3 gap-4">
            {[
              { k: "Domain", v: "FinTech · Streaming · Enterprise Billing" },
              { k: "Stack", v: "Spark · Kafka · Snowflake · Airflow · AWS" },
              { k: "Edge", v: "Pipeline automation · 90% latency cuts" },
            ].map((item) => (
              <div key={item.k} className="gradient-card rounded-2xl p-5">
                <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  {item.k}
                </div>
                <div className="mt-2 text-sm font-medium">{item.v}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
