import { useState, useCallback, useRef, useEffect } from "react";

type VoiceState = "idle" | "listening" | "speaking";

export function useVoice() {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesReady = useRef(false);
  const [supported] = useState(() => {
    if (typeof window === "undefined") return { stt: false, tts: false };
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    return { stt: !!SpeechRecognition, tts: !!window.speechSynthesis };
  });

  // Load voices
  useEffect(() => {
    if (!supported.tts) return;
    const loadVoices = () => { voicesReady.current = true; };
    speechSynthesis.addEventListener("voiceschanged", loadVoices);
    if (speechSynthesis.getVoices().length > 0) voicesReady.current = true;
    return () => speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [supported.tts]);

  const getFemaleVoice = useCallback(() => {
    const voices = speechSynthesis.getVoices();
    const preferred = ["Samantha", "Google US English", "Microsoft Zira", "Karen", "Victoria", "Tessa"];
    for (const name of preferred) {
      const v = voices.find(v => v.name.includes(name));
      if (v) return v;
    }
    // Fallback to first female-sounding English voice
    const english = voices.filter(v => v.lang.startsWith("en"));
    return english.find(v => /female|woman/i.test(v.name)) || english[0] || voices[0];
  }, []);

  const startListening = useCallback((onResult: (text: string) => void) => {
    if (!supported.stt) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setState("listening");
    recognition.onresult = (e: any) => {
      const result = Array.from(e.results).map((r: any) => r[0].transcript).join("");
      setTranscript(result);
    };
    recognition.onend = () => {
      setState("idle");
      const finalTranscript = transcript;
      // Get the final result
      if (recognition._lastResult) onResult(recognition._lastResult);
    };
    recognition.onerror = () => setState("idle");

    // Capture final result
    recognition.addEventListener("result", (e: any) => {
      for (const result of e.results) {
        if (result.isFinal) {
          recognition._lastResult = result[0].transcript;
          onResult(result[0].transcript);
        }
      }
    });

    recognitionRef.current = recognition;
    recognition.start();
  }, [supported.stt, transcript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setState("idle");
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!supported.tts) { onEnd?.(); return; }
    speechSynthesis.cancel();

    // Strip markdown
    const clean = text
      .replace(/```[\s\S]*?```/g, "code block omitted")
      .replace(/[#*_`~>\[\]()!]/g, "")
      .replace(/\n+/g, ". ")
      .slice(0, 500);

    const utterance = new SpeechSynthesisUtterance(clean);
    const voice = getFemaleVoice();
    if (voice) utterance.voice = voice;
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.volume = 0.9;

    utterance.onstart = () => setState("speaking");
    utterance.onend = () => { setState("idle"); onEnd?.(); };
    utterance.onerror = () => { setState("idle"); onEnd?.(); };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [supported.tts, getFemaleVoice]);

  const stopSpeaking = useCallback(() => {
    speechSynthesis.cancel();
    setState("idle");
  }, []);

  return { state, transcript, startListening, stopListening, speak, stopSpeaking, supported };
}