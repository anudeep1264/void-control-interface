import { type AiMode } from "@/lib/streamChat";
import { Palette, Code2, Workflow, ShieldAlert, BookOpen } from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface ModeInfo {
  label: string;
  subtitle: string;
  icon: LucideIcon;
  textColor: string;
  dotColor: string;
  bgActive: string;
  borderActive: string;
  placeholder: string;
}

export const MODE_CONFIG: Record<AiMode, ModeInfo> = {
  creative: {
    label: "CREATIVE MODE",
    subtitle: "Content Generation & Ideation",
    icon: Palette,
    textColor: "text-[hsl(var(--neon-pink))]",
    dotColor: "bg-[hsl(var(--neon-pink))]",
    bgActive: "bg-[hsl(var(--neon-pink)/0.15)]",
    borderActive: "border-[hsl(var(--neon-pink)/0.5)]",
    placeholder: "Describe what you want to create...",
  },
  developer: {
    label: "DEVELOPER MODE",
    subtitle: "Code & Technical Solutions",
    icon: Code2,
    textColor: "text-[hsl(var(--neon-cyan))]",
    dotColor: "bg-[hsl(var(--neon-cyan))]",
    bgActive: "bg-[hsl(var(--neon-cyan)/0.15)]",
    borderActive: "border-[hsl(var(--neon-cyan)/0.5)]",
    placeholder: "Describe your coding challenge...",
  },
  automation: {
    label: "AUTOMATION MODE",
    subtitle: "Workflow Orchestration",
    icon: Workflow,
    textColor: "text-[hsl(var(--neon-purple))]",
    dotColor: "bg-[hsl(var(--neon-purple))]",
    bgActive: "bg-[hsl(var(--neon-purple)/0.15)]",
    borderActive: "border-[hsl(var(--neon-purple)/0.5)]",
    placeholder: "Describe the task to automate...",
  },
  security: {
    label: "SECURITY MODE",
    subtitle: "Threat Analysis & Defense",
    icon: ShieldAlert,
    textColor: "text-destructive",
    dotColor: "bg-destructive",
    bgActive: "bg-destructive/15",
    borderActive: "border-destructive/50",
    placeholder: "Describe the security concern...",
  },
  research: {
    label: "RESEARCH MODE",
    subtitle: "Analysis & Documentation",
    icon: BookOpen,
    textColor: "text-[hsl(var(--neon-green))]",
    dotColor: "bg-[hsl(var(--neon-green))]",
    bgActive: "bg-[hsl(var(--neon-green)/0.15)]",
    borderActive: "border-[hsl(var(--neon-green)/0.5)]",
    placeholder: "What would you like to research...",
  },
};
