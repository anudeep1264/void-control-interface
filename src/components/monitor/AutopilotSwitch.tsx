import { Switch } from "@/components/ui/switch";
import { Bot } from "lucide-react";

export const AutopilotSwitch = ({ on, onToggle }: { on: boolean; onToggle: (v: boolean) => void }) => (
  <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/30 backdrop-blur-md px-4 py-3">
    <div className="w-9 h-9 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center">
      <Bot className="w-4 h-4 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-display text-sm tracking-wider">AUTO MONITOR</div>
      <div className="text-[10px] font-mono text-muted-foreground">
        {on ? "Continuous tracking · 1.5s cadence" : "Manual cadence · 2.5s while visible"}
      </div>
    </div>
    <Switch checked={on} onCheckedChange={onToggle} />
  </div>
);
