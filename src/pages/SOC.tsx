import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { useSOCSession } from "@/hooks/useSOCSession";
import { RiskGauge } from "@/components/soc/RiskGauge";
import { LiveFeed } from "@/components/soc/LiveFeed";
import { AlertFeed } from "@/components/soc/AlertFeed";
import { EventStream } from "@/components/soc/EventStream";
import { SessionTimeline } from "@/components/soc/SessionTimeline";
import { AgentStubPanel } from "@/components/soc/AgentStubPanel";
import { BiometricsPanel } from "@/components/soc/BiometricsPanel";
import { CaptureControls } from "@/components/soc/CaptureControls";

const SOC = () => {
  const s = useSOCSession();

  return (
    <div className="flex-1 flex flex-col overflow-y-auto relative z-10">
      <div className="border-b border-border/40 bg-card/40 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3 max-w-[1600px] w-full mx-auto">
          <div className="relative w-9 h-9 rounded-lg border border-destructive/40 bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-destructive" />
            <motion.div
              className="absolute inset-0 rounded-lg border border-destructive/40"
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div>
            <h1 className="font-display text-sm font-bold tracking-[0.25em] text-primary">VLAD Ω · SECURITY OPERATIONS CENTER</h1>
            <p className="text-[10px] font-mono text-muted-foreground tracking-widest">
              REAL-TIME SCREEN MONITORING · THREAT DETECTION · FORENSICS
            </p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-2">
            {s.capture.active && (
              <span className="px-2 py-1 rounded bg-accent/10 border border-accent/40 text-accent text-[9px] font-mono tracking-widest">● LIVE</span>
            )}
            {s.sessionId && (
              <span className="px-2 py-1 rounded bg-muted/30 border border-border/40 text-[9px] font-mono tracking-widest text-muted-foreground">
                SID {s.sessionId.slice(0, 8)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 max-w-[1600px] w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <LiveFeed active={s.capture.active} latest={s.capture.latest} error={s.capture.error} ocrStatus={s.ocrStatus} />
            <SessionTimeline frames={s.frames} />
            <EventStream events={s.events} />
          </div>
          <div className="space-y-3 sm:space-y-4">
            <CaptureControls active={s.capture.active} onStart={s.startSession} onStop={s.stopSession} />
            <RiskGauge risk={s.risk} severity={s.severity} state={s.state} />
            <AlertFeed alerts={s.alerts} />
            <BiometricsPanel snap={s.biometrics} />
            <AgentStubPanel signal={s.agentSignal as never} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOC;
