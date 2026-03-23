import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, CheckCircle2, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const plans = [
  { name: "BASIC", price: "$0", features: ["5 AI queries/day", "Basic monitoring", "Email support"], current: true },
  { name: "PRO", price: "$29", features: ["Unlimited AI queries", "Advanced analytics", "Priority support", "Custom alerts"], current: false },
  { name: "ENTERPRISE", price: "$99", features: ["Everything in Pro", "Dedicated instance", "SLA guarantee", "API access", "White-label"], current: false },
];

const Subscriptions = () => {
  const { user } = useAuth();

  return (
    <div className="flex-1 overflow-y-auto p-6 relative z-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-primary" />
          <h2 className="font-display text-xl font-bold text-primary text-glow-blue tracking-widest">SUBSCRIPTIONS</h2>
        </div>
        <p className="text-sm font-mono-tech text-muted-foreground mt-2 tracking-wider">
          MANAGE YOUR ACCESS TIER
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`holo-card rounded-xl p-6 border ${
              plan.current ? "border-primary/40 glow-blue" : "border-border"
            } relative`}
          >
            {plan.current && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary/20 border border-primary/30 rounded-full">
                <span className="text-[10px] font-mono-tech text-primary tracking-widest">CURRENT</span>
              </div>
            )}
            <h3 className="font-display text-lg font-bold text-foreground tracking-widest mb-2">{plan.name}</h3>
            <p className="font-display text-3xl font-bold text-primary text-glow-blue mb-4">{plan.price}<span className="text-sm text-muted-foreground">/mo</span></p>
            <ul className="space-y-2 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm font-body text-foreground">
                  <CheckCircle2 className="w-3 h-3 text-accent shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-2.5 rounded-lg font-display text-xs tracking-widest transition-all ${
                plan.current
                  ? "bg-muted border border-border text-muted-foreground cursor-default"
                  : "bg-primary/10 border border-primary/30 text-primary glow-blue hover:bg-primary/20"
              }`}
              disabled={plan.current}
            >
              {plan.current ? "ACTIVE" : "UPGRADE"}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Subscriptions;
