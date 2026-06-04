import { useCallback, useEffect, useRef, useState } from "react";

export interface CaptureFrame {
  canvas: HTMLCanvasElement;
  thumbDataUrl: string;
  capturedAt: number;
}

interface DisplayMediaStreamOptions {
  video?: MediaTrackConstraints | boolean;
  audio?: boolean;
}
interface MediaDevicesWithGDM extends MediaDevices {
  getDisplayMedia?: (constraints?: DisplayMediaStreamOptions) => Promise<MediaStream>;
}

export function useScreenCapture(intervalMs = 2500) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const tickRef = useRef<number | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latest, setLatest] = useState<CaptureFrame | null>(null);
  const subsRef = useRef<Set<(f: CaptureFrame) => void>>(new Set());

  const stop = useCallback(() => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setActive(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    try {
      const md = navigator.mediaDevices as MediaDevicesWithGDM;
      if (!md.getDisplayMedia) throw new Error("Screen capture not supported in this browser.");
      const stream = await md.getDisplayMedia({ video: { frameRate: 4 }, audio: false });
      streamRef.current = stream;
      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      await video.play();
      videoRef.current = video;
      stream.getVideoTracks()[0].addEventListener("ended", stop);

      const grab = () => {
        const v = videoRef.current;
        if (!v || v.videoWidth === 0) return;
        const w = Math.min(640, v.videoWidth);
        const h = Math.round((v.videoHeight / v.videoWidth) * w);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(v, 0, 0, w, h);
        // Tiny thumb for storage/UI
        const thumbC = document.createElement("canvas");
        thumbC.width = 240; thumbC.height = Math.round((h / w) * 240);
        thumbC.getContext("2d")!.drawImage(canvas, 0, 0, thumbC.width, thumbC.height);
        const frame: CaptureFrame = { canvas, thumbDataUrl: thumbC.toDataURL("image/jpeg", 0.55), capturedAt: Date.now() };
        setLatest(frame);
        subsRef.current.forEach((cb) => cb(frame));
      };
      grab();
      tickRef.current = window.setInterval(grab, intervalMs);
      setActive(true);
    } catch (e) {
      setError((e as Error).message);
      stop();
    }
  }, [intervalMs, stop]);

  const onFrame = useCallback((cb: (f: CaptureFrame) => void) => {
    subsRef.current.add(cb);
    return () => { subsRef.current.delete(cb); };
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { active, error, latest, start, stop, onFrame };
}
