import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";

interface Props {
  voiceState: "idle" | "listening" | "speaking";
  onStartListening: () => void;
  onStopListening: () => void;
  onStopSpeaking: () => void;
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
}

export const VoiceControls = ({
  voiceState,
  onStartListening,
  onStopListening,
  onStopSpeaking,
  autoSpeak,
  onToggleAutoSpeak,
}: Props) => {
  const isListening = voiceState === "listening";
  const isSpeaking = voiceState === "speaking";

  return (
    <div className="flex items-center gap-1.5">
      {/* Voice status indicator */}
      <AnimatePresence>
        {(isListening || isSpeaking) && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="overflow-hidden"
          >
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-mono-tech tracking-widest ${
              isListening
                ? "bg-destructive/10 border border-destructive/30 text-destructive"
                : "bg-primary/10 border border-primary/30 text-primary"
            }`}>
              <span className="relative flex h-1.5 w-1.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isListening ? "bg-destructive" : "bg-primary"
                }`} />
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                  isListening ? "bg-destructive" : "bg-primary"
                }`} />
              </span>
              {isListening ? "LISTENING…" : "SPEAKING…"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mic button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={isListening ? onStopListening : onStartListening}
        className={`relative p-2 rounded-lg border transition-all ${
          isListening
            ? "bg-destructive/20 border-destructive/50 text-destructive glow-blue"
            : "bg-muted border-border text-muted-foreground hover:text-primary hover:border-primary/30"
        }`}
        title={isListening ? "Stop listening" : "Start voice input"}
      >
        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        {isListening && (
          <>
            <motion.span
              className="absolute inset-0 rounded-lg border border-destructive/40"
              animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.span
              className="absolute inset-0 rounded-lg border border-destructive/20"
              animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            />
          </>
        )}
      </motion.button>

      {/* Auto-speak toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={isSpeaking ? onStopSpeaking : onToggleAutoSpeak}
        className={`p-2 rounded-lg border transition-all ${
          isSpeaking
            ? "bg-primary/20 border-primary/50 text-primary animate-pulse"
            : autoSpeak
              ? "bg-primary/10 border-primary/30 text-primary"
              : "bg-muted border-border text-muted-foreground hover:text-primary hover:border-primary/30"
        }`}
        title={isSpeaking ? "Stop speaking" : autoSpeak ? "Disable auto-speak" : "Enable auto-speak"}
      >
        {autoSpeak || isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </motion.button>
    </div>
  );
};