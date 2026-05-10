import { jsPDF } from "jspdf";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  name: string;
  title: string;
  tagline: string;
  about: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string | null;
  github: string | null;
}

interface Experience {
  company: string;
  role: string;
  location: string;
  period: string;
  highlights: { metric: string; text: string }[];
  tech_stack?: string[];
  sort_order: number;
}

interface Skill {
  name: string;
  group_title: string;
  group_order: number;
  sort_order: number;
}

interface Education {
  degree: string;
  institution: string;
  location: string;
  period: string;
  sort_order: number;
}

const PAGE_W = 8.5;
const PAGE_H = 11;
const MARGIN = 0.5;
const CONTENT_W = PAGE_W - MARGIN * 2;

export async function generateResumePDF() {
  const [profileRes, expRes, skillsRes, eduRes] = await Promise.all([
    supabase.from("profile").select("*").eq("id", 1).maybeSingle(),
    supabase.from("experience").select("*").order("sort_order"),
    supabase.from("skills").select("*").order("group_order").order("sort_order"),
    supabase.from("education").select("*").order("sort_order"),
  ]);

  const profile = profileRes.data as Profile | null;
  const experience = (expRes.data || []) as unknown as Experience[];
  const skills = (skillsRes.data || []) as unknown as Skill[];
  const education = (eduRes.data || []) as unknown as Education[];

  if (!profile) throw new Error("Profile not found");

  const doc = new jsPDF({ unit: "in", format: "letter" });
  let y = MARGIN;

  const ensureSpace = (needed: number) => {
    if (y + needed > PAGE_H - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const setText = (size: number, bold = false, color: [number, number, number] = [20, 20, 20]) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...color);
  };

  const writeWrapped = (text: string, x: number, maxW: number, lineH: number) => {
    const lines = doc.splitTextToSize(text, maxW) as string[];
    for (const line of lines) {
      ensureSpace(lineH);
      doc.text(line, x, y);
      y += lineH;
    }
  };

  const sectionHeader = (title: string) => {
    ensureSpace(0.45);
    y += 0.08;
    setText(11, true, [0, 0, 0]);
    doc.text(title.toUpperCase(), MARGIN, y);
    y += 0.06;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.012);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 0.16;
  };

  // ===== HEADER =====
  setText(22, true, [0, 0, 0]);
  doc.text(profile.name, MARGIN, y);
  y += 0.3;

  setText(11, false, [70, 70, 70]);
  doc.text(profile.title, MARGIN, y);
  y += 0.22;

  // Contact line
  setText(9, false, [60, 60, 60]);
  const contactParts = [
    profile.location,
    profile.email,
    profile.phone,
    profile.linkedin,
    profile.github,
  ].filter(Boolean) as string[];
  writeWrapped(contactParts.join("  •  "), MARGIN, CONTENT_W, 0.16);
  y += 0.05;

  // ===== SUMMARY =====
  if (profile.about) {
    sectionHeader("Professional Summary");
    setText(10, false, [30, 30, 30]);
    writeWrapped(profile.about, MARGIN, CONTENT_W, 0.18);
  }

  // ===== SKILLS =====
  if (skills.length) {
    sectionHeader("Technical Skills");
    const groups = new Map<string, string[]>();
    const groupOrder: string[] = [];
    for (const s of skills) {
      if (!groups.has(s.group_title)) {
        groups.set(s.group_title, []);
        groupOrder.push(s.group_title);
      }
      groups.get(s.group_title)!.push(s.name);
    }
    for (const g of groupOrder) {
      const names = groups.get(g)!.join(", ");
      ensureSpace(0.2);
      setText(10, true, [0, 0, 0]);
      const labelW = doc.getTextWidth(`${g}: `);
      doc.text(`${g}:`, MARGIN, y);
      setText(10, false, [30, 30, 30]);
      const wrapW = CONTENT_W - labelW - 0.05;
      const lines = doc.splitTextToSize(names, wrapW) as string[];
      doc.text(lines[0], MARGIN + labelW + 0.05, y);
      y += 0.18;
      for (let i = 1; i < lines.length; i++) {
        ensureSpace(0.18);
        doc.text(lines[i], MARGIN + labelW + 0.05, y);
        y += 0.18;
      }
      y += 0.04;
    }
  }

  // ===== EXPERIENCE =====
  if (experience.length) {
    sectionHeader("Professional Experience");
    for (const exp of experience) {
      ensureSpace(0.5);
      setText(11, true, [0, 0, 0]);
      doc.text(exp.role, MARGIN, y);
      setText(10, false, [60, 60, 60]);
      doc.text(exp.period, PAGE_W - MARGIN, y, { align: "right" });
      y += 0.2;

      setText(10, true, [40, 40, 40]);
      doc.text(exp.company, MARGIN, y);
      setText(9, false, [80, 80, 80]);
      doc.text(exp.location, PAGE_W - MARGIN, y, { align: "right" });
      y += 0.2;

      setText(10, false, [25, 25, 25]);
      for (const h of exp.highlights || []) {
        const text = `• ${h.text}`;
        const lines = doc.splitTextToSize(text, CONTENT_W - 0.15) as string[];
        for (let i = 0; i < lines.length; i++) {
          ensureSpace(0.18);
          doc.text(lines[i], MARGIN + (i === 0 ? 0 : 0.15), y);
          y += 0.18;
        }
      }

      if (exp.tech_stack && exp.tech_stack.length) {
        ensureSpace(0.2);
        setText(9, true, [60, 60, 60]);
        const label = "Tech: ";
        doc.text(label, MARGIN, y);
        setText(9, false, [60, 60, 60]);
        const labelW = doc.getTextWidth(label);
        const stackText = exp.tech_stack.join(", ");
        const lines = doc.splitTextToSize(stackText, CONTENT_W - labelW) as string[];
        doc.text(lines[0], MARGIN + labelW, y);
        y += 0.16;
        for (let i = 1; i < lines.length; i++) {
          ensureSpace(0.16);
          doc.text(lines[i], MARGIN + labelW, y);
          y += 0.16;
        }
      }
      y += 0.12;
    }
  }

  // ===== EDUCATION =====
  if (education.length) {
    sectionHeader("Education");
    for (const e of education) {
      ensureSpace(0.4);
      setText(11, true, [0, 0, 0]);
      doc.text(e.degree, MARGIN, y);
      setText(10, false, [60, 60, 60]);
      if (e.period) doc.text(e.period, PAGE_W - MARGIN, y, { align: "right" });
      y += 0.2;
      setText(10, false, [40, 40, 40]);
      const inst = e.location ? `${e.institution} — ${e.location}` : e.institution;
      doc.text(inst, MARGIN, y);
      y += 0.22;
    }
  }

  const fileName = `${profile.name.replace(/\s+/g, "_")}_Resume.pdf`;
  doc.save(fileName);
}
