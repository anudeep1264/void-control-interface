import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Save, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface SettingItem {
  key: string;
  label: string;
  type: "toggle" | "select";
  options?: string[];
}

const settingsConfig: SettingItem[] = [
  { key: "matrix_rain", label: "Matrix Rain Background", type: "toggle" },
  { key: "scanlines", label: "Scanline Overlay", type: "toggle" },
  { key: "sound_effects", label: "Sound Effects", type: "toggle" },
  { key: "notification_level", label: "Notification Level", type: "select", options: ["all", "warnings_only", "critical_only", "none"] },
  { key: "theme_accent", label: "Primary Accent", type: "select", options: ["blue", "green", "purple", "cyan", "pink"] },
];

const SettingsPage = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Record<string, string>>({
    matrix_rain: "true",
    scanlines: "true",
    sound_effects: "false",
    notification_level: "all",
    theme_accent: "blue",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) loadSettings();
  }, [user]);

  const loadSettings = async () => {
    const { data } = await supabase.from("user_settings").select("*").eq("user_id", user!.id);
    if (data) {
      const map: Record<string, string> = {};
      data.forEach((s) => { map[s.setting_key] = s.setting_value || ""; });
      setSettings((prev) => ({ ...prev, ...map }));
    }
  };

  const saveSetting = async (key: string, value: string) => {
    if (!user) return;
    setSettings((prev) => ({ ...prev, [key]: value }));
    const { error } = await supabase
      .from("user_settings")
      .upsert({ user_id: user.id, setting_key: key, setting_value: value }, { onConflict: "user_id,setting_key" });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const resetAll = async () => {
    if (!user) return;
    await supabase.from("user_settings").delete().eq("user_id", user.id);
    setSettings({
      matrix_rain: "true",
      scanlines: "true",
      sound_effects: "false",
      notification_level: "all",
      theme_accent: "blue",
    });
    toast({ title: "SETTINGS RESET", description: "All settings restored to defaults." });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 relative z-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-primary" />
            <h2 className="font-display text-xl font-bold text-primary text-glow-blue tracking-widest">SETTINGS</h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetAll}
            className="px-3 py-1.5 rounded-lg bg-muted border border-border text-muted-foreground font-mono-tech text-xs tracking-wider hover:border-primary/20 transition-all flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> RESET
          </motion.button>
        </div>
      </motion.div>

      <div className="max-w-lg space-y-3">
        {settingsConfig.map((item, i) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="holo-card rounded-lg p-4 flex items-center justify-between"
          >
            <span className="text-sm font-body text-foreground">{item.label}</span>
            {item.type === "toggle" ? (
              <button
                onClick={() => saveSetting(item.key, settings[item.key] === "true" ? "false" : "true")}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  settings[item.key] === "true" ? "bg-primary/30 border border-primary/50" : "bg-muted border border-border"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${
                    settings[item.key] === "true" ? "left-6 bg-primary glow-blue" : "left-0.5 bg-muted-foreground"
                  }`}
                />
              </button>
            ) : (
              <select
                value={settings[item.key]}
                onChange={(e) => saveSetting(item.key, e.target.value)}
                className="px-3 py-1.5 bg-muted border border-border rounded-lg text-xs font-mono-tech text-foreground focus:outline-none focus:border-primary/50"
              >
                {item.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt.toUpperCase().replace(/_/g, " ")}</option>
                ))}
              </select>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;
