import { useEffect, useState } from "react";
import bg from "@/assets/tech-bg.jpg";

/**
 * Netflix-style fixed backdrop: a rich, dark tech-tools collage that fades to
 * solid black as the user scrolls. Pointer-events disabled.
 */
export function TechBackdrop() {
  const [opacity, setOpacity] = useState(0.85);

  useEffect(() => {
    const onScroll = () => {
      const max = Math.max(window.innerHeight * 1.4, 1);
      const y = window.scrollY;
      const next = Math.max(0.05, 0.85 * (1 - y / max));
      setOpacity(next);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Image layer */}
      <div
        className="absolute inset-0 bg-center bg-cover transition-opacity duration-200"
        style={{
          backgroundImage: `url(${bg})`,
          filter: "blur(1px) saturate(1.15) brightness(0.95)",
          transform: "scale(1.06)",
          opacity,
        }}
      />
      {/* Subtle red cinematic glow (Netflix vibe) */}
      <div
        className="absolute inset-0 transition-opacity duration-200"
        style={{
          opacity: Math.min(1, opacity * 1.2),
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(229,9,20,0.20), transparent 60%)",
        }}
      />
      {/* Vignette for legibility (kept light so image still reads) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 30%, transparent, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.85) 100%)",
        }}
      />
      {/* Bottom fade to solid background */}
      <div
        className="absolute inset-x-0 bottom-0 h-[60vh]"
        style={{
          background:
            "linear-gradient(to bottom, transparent, var(--color-background) 80%)",
        }}
      />
    </div>
  );
}
