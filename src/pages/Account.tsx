import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Shield, Calendar, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const Account = () => {
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
    if (data) setDisplayName(data.display_name || "");
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("user_id", user.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "PROFILE UPDATED", description: "Changes saved successfully." });
    setSaving(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 relative z-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3">
          <User className="w-6 h-6 text-primary" />
          <h2 className="font-display text-xl font-bold text-primary text-glow-blue tracking-widest">ACCOUNT</h2>
        </div>
      </motion.div>

      <div className="max-w-lg space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="holo-card rounded-xl p-6">
          <h3 className="font-display text-xs font-semibold text-muted-foreground tracking-[0.2em] mb-4">OPERATOR PROFILE</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-mono-tech text-muted-foreground tracking-wider mb-1 block">DISPLAY NAME</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground font-mono-tech text-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-mono-tech text-muted-foreground tracking-wider mb-1 block">EMAIL</label>
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border border-border rounded-lg">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-mono-tech text-foreground">{user?.email}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-mono-tech text-muted-foreground tracking-wider mb-1 block">MEMBER SINCE</label>
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border border-border rounded-lg">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-mono-tech text-foreground">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                </span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={saveProfile}
              disabled={saving}
              className="w-full py-2.5 rounded-lg bg-primary/10 border border-primary/30 text-primary font-display text-xs tracking-widest glow-blue hover:bg-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-3 h-3" />
              {saving ? "SAVING..." : "SAVE CHANGES"}
            </motion.button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="holo-card rounded-xl p-6">
          <h3 className="font-display text-xs font-semibold text-destructive tracking-[0.2em] mb-4">DANGER ZONE</h3>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={signOut}
            className="w-full py-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive font-display text-xs tracking-widest hover:bg-destructive/20 transition-all"
          >
            TERMINATE SESSION
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Account;
