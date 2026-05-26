import { useEffect, useRef, useState } from "react";

export interface DeviceTelemetry {
  cpuHint: number;
  memUsedGb: number;
  memTotalGb: number;
  storageUsed: number;
  storageTotal: number;
  downlinkMbps: number;
  rttMs: number;
  interactions: number;
  idleSeconds: number;
  tabVisible: boolean;
}

export const useDeviceTelemetry = () => {
  const [telemetry, setTelemetry] = useState<DeviceTelemetry>({
    cpuHint: 30,
    memUsedGb: 0,
    memTotalGb: 0,
    storageUsed: 0,
    storageTotal: 0,
    downlinkMbps: 0,
    rttMs: 0,
    interactions: 0,
    idleSeconds: 0,
    tabVisible: true,
  });

  const interactionsRef = useRef(0);
  const lastActiveRef = useRef(Date.now());
  const tabVisibleRef = useRef(true);

  // Bind event listeners
  useEffect(() => {
    const bump = () => {
      interactionsRef.current += 1;
      lastActiveRef.current = Date.now();
    };
    const onVis = () => {
      tabVisibleRef.current = document.visibilityState === "visible";
    };
    window.addEventListener("mousemove", bump, { passive: true });
    window.addEventListener("mousedown", bump);
    window.addEventListener("keydown", bump);
    window.addEventListener("scroll", bump, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("mousemove", bump);
      window.removeEventListener("mousedown", bump);
      window.removeEventListener("keydown", bump);
      window.removeEventListener("scroll", bump);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Sample telemetry every second
  useEffect(() => {
    const sample = async () => {
      const nav = navigator as Navigator & {
        deviceMemory?: number;
        connection?: { downlink?: number; rtt?: number };
      };
      const perf = performance as Performance & {
        memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number; totalJSHeapSize: number };
      };

      const cores = navigator.hardwareConcurrency || 4;
      const memTotal = nav.deviceMemory || 8;
      const heap = perf.memory;
      const memUsed = heap ? heap.usedJSHeapSize / (1024 ** 3) * (memTotal / Math.max(1, heap.jsHeapSizeLimit / (1024 ** 3))) : memTotal * 0.35;

      let storageUsed = 0;
      let storageTotal = 0;
      try {
        if (navigator.storage?.estimate) {
          const est = await navigator.storage.estimate();
          storageUsed = est.usage ?? 0;
          storageTotal = est.quota ?? 0;
        }
      } catch { /* ignore */ }

      const conn = nav.connection;
      const downlink = conn?.downlink ?? 10;
      const rtt = conn?.rtt ?? 50;

      // CPU hint from interaction rate (browsers don't expose CPU directly)
      const cpuHint = Math.min(80, 18 + interactionsRef.current * 0.5 + cores * 2);

      setTelemetry({
        cpuHint,
        memUsedGb: memUsed,
        memTotalGb: memTotal,
        storageUsed,
        storageTotal,
        downlinkMbps: downlink,
        rttMs: rtt,
        interactions: interactionsRef.current,
        idleSeconds: Math.floor((Date.now() - lastActiveRef.current) / 1000),
        tabVisible: tabVisibleRef.current,
      });
    };
    sample();
    const i = setInterval(sample, 1000);
    return () => clearInterval(i);
  }, []);

  const resetInteractions = () => { interactionsRef.current = 0; };

  return { telemetry, resetInteractions };
};
