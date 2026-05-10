import { Globe } from "lucide-react";
import { SiGithub, SiInstagram, SiYoutube, SiX } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa6";
import type { IconType } from "react-icons";

export interface SocialProfile {
  linkedin?: string | null;
  github?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  twitter?: string | null;
  website?: string | null;
}

type Item = {
  key: keyof SocialProfile;
  label: string;
  Icon: IconType | React.ComponentType<{ className?: string }>;
  brand: string; // brand color
};

const ITEMS: Item[] = [
  { key: "linkedin", label: "LinkedIn", Icon: FaLinkedin, brand: "#0A66C2" },
  { key: "github", label: "GitHub", Icon: SiGithub, brand: "#ffffff" },
  { key: "twitter", label: "Twitter / X", Icon: SiX, brand: "#ffffff" },
  { key: "instagram", label: "Instagram", Icon: SiInstagram, brand: "#E1306C" },
  { key: "youtube", label: "YouTube", Icon: SiYoutube, brand: "#FF0000" },
  { key: "website", label: "Website", Icon: Globe, brand: "#22d3ee" },
];

function normalizeUrl(v: string) {
  const t = v.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

interface Props {
  profile: SocialProfile;
  variant?: "pill" | "icon";
  className?: string;
}

export function SocialLinks({ profile, variant = "icon", className = "" }: Props) {
  const present = ITEMS.filter((i) => {
    const v = profile[i.key];
    return typeof v === "string" && v.trim().length > 0;
  });

  if (!present.length) return null;

  if (variant === "pill") {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        {present.map(({ key, label, Icon, brand }) => (
          <a
            key={key}
            href={normalizeUrl(profile[key] as string)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="group inline-flex items-center gap-1.5 glass rounded-full px-3 py-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-all hover:-translate-y-0.5"
            style={{ ["--brand" as string]: brand }}
          >
            <Icon className="h-4 w-4 transition-colors" style={{ color: brand }} />
            <span>{label}</span>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {present.map(({ key, label, Icon, brand }) => (
        <a
          key={key}
          href={normalizeUrl(profile[key] as string)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className="grid h-11 w-11 place-items-center rounded-full border border-border/60 bg-surface/60 hover:bg-surface transition-all hover:-translate-y-0.5"
          style={{ ["--brand" as string]: brand }}
        >
          <Icon className="h-5 w-5" style={{ color: brand }} />
        </a>
      ))}
    </div>
  );
}
