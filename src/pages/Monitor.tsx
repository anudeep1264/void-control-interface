import { useState } from "react";
import { motion } from "framer-motion";
import { Radio } from "lucide-react";
import { useMonitoringStream } from "@/hooks/useMonitoringStream";
import { MonitorHero } from "@/components/monitor/MonitorHero";
import { MetricsChart } from "@/components/monitor/MetricsChart";
import { NetworkPanel } from "@/components/monitor/NetworkPanel";
import { StoragePanel } from "@/components/monitor/StoragePanel";
import { BehaviorPanel } from "@/components/monitor/BehaviorPanel";
import { AwarenessPanel } from "@/components/monitor/AwarenessPanel";
import { AIDecisionEngine } from "@/components/monitor/AIDecisionEngine";
import { SecurityLadder } from "@/components/monitor/SecurityLadder";
import { AutopilotSwitch } from "@/components/monitor/AutopilotSwitch";

const Monitor = () => {
  const [autopilot, setAutopilot] = useState(true);
  const { latest, history, insights, telemetry } = useMonitoringStream(autopilot);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto relative z-10">
      <div className="border-b border-border/40 bg-card/40 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="relative w-9 h-9 rounded-lg border border-accent/40 bg-accent/10 flex items-center justify-center">
            <Radio className="w-4 h-4 text-accent" />
            <motion.div className="absolute inset-0 rounded-lg border border-accent/40" animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 2, repeat: Infinity }} />
          </div>
          <div>
            <h1 className="font-display text-sm font-bold tracking-[0.25em] text-primary">MONITORING CENTER</h1>
            <p className="text-[10px] font-mono text-muted-foreground tracking-widest">REAL-TIME SYSTEM INTELLIGENCE</p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-muted/30 border border-accent/30">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            <span className="text-[9px] font-mono text-accent tracking-widest">STREAMING</span>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 max-w-[1600px] w-full mx-auto">
        <MonitorHero m={latest} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <MetricsChart history={history} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <NetworkPanel m={latest} />
              <StoragePanel m={latest} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <BehaviorPanel t={telemetry} />
              <AwarenessPanel t={telemetry} />
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <AutopilotSwitch on={autopilot} onToggle={setAutopilot} />
            <AIDecisionEngine m={latest} insights={insights} />
            <SecurityLadder m={latest} insights={insights} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Monitor;
