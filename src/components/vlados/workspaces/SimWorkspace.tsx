import { Mail, Calendar, FileText, Video, Music, BookOpen, Users, Code2, Globe, Workflow, LucideIcon } from "lucide-react";
import type { WorkspaceId } from "./types";

const WORKSPACE_META: Record<Exclude<WorkspaceId, "home" | "image">, { icon: LucideIcon; label: string; note: string }> = {
  research: { icon: Globe, label: "Research workspace", note: "Speak a research request to begin. Results appear when the research service returns them." },
  automation: { icon: Workflow, label: "Automation center", note: "No active automations are available." },
  email: { icon: Mail, label: "Email workspace", note: "Email data is unavailable until a supported mail account is connected." },
  calendar: { icon: Calendar, label: "Calendar workspace", note: "Calendar data is unavailable until a supported calendar is connected." },
  files: { icon: FileText, label: "File workspace", note: "No connected file source is available." },
  meetings: { icon: Video, label: "Meetings workspace", note: "Meeting data is unavailable until a supported service is connected." },
  media: { icon: Music, label: "Media workspace", note: "Media controls are unavailable until a supported service is connected." },
  memory: { icon: BookOpen, label: "Memory ledger", note: "Speak naturally to create or recall memories through VLAD." },
  agents: { icon: Users, label: "Agent studio", note: "Agent activity appears here only when an agent run is active." },
  code: { icon: Code2, label: "Developer workspace", note: "Repository data is unavailable until a supported source is connected." },
};

export const SimWorkspace = ({ id }: { id: Exclude<WorkspaceId, "home" | "image"> }) => {
  const meta = WORKSPACE_META[id];
  const Icon = meta.icon;
  return (
    <div className="p-4 sm:p-6">
      <section className="mx-auto max-w-2xl rounded-md border bg-card p-6 sm:p-10">
        <Icon className="mb-12 h-6 w-6 text-primary" />
        <small className="uppercase text-accent">Focused workspace</small>
        <h2 className="mt-3 text-3xl">{meta.label}</h2>
        <p className="mt-4 max-w-lg leading-7 text-muted-foreground">{meta.note}</p>
        <div className="mt-10 border-t pt-4 text-sm text-muted-foreground">Data unavailable</div>
      </section>
    </div>
  );
};