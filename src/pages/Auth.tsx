import { useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import MatrixRain from "@/components/MatrixRain";

const Auth = () => {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        toast({ title: "ACCESS GRANTED", description: "Welcome back, operator." });
      } else {
        await signUp(email, password, displayName);
        toast({ title: "ACCOUNT CREATED", description: "Check your email to verify your account." });
      }
    } catch (err: any) {
      toast({ title: "ACCESS DENIED", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <MatrixRain />
      <div className="fixed inset-0 scanline pointer-events-none z-[1]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="holo-card rounded-2xl p-8 border border-primary/30">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-muted glow-blue mb-4">
              <Zap className="w-8 h-8 text-primary" />
              <div className="absolute inset-0 rounded-2xl animate-pulse-glow border border-primary/30" />
            </div>
            <h1 className="font-display text-2xl font-bold text-primary text-glow-blue tracking-widest">
              VLAD AI
            </h1>
            <p className="text-xs font-mono-tech text-muted-foreground tracking-[0.3em] mt-1">
              {isLogin ? "AUTHENTICATION REQUIRED" : "NEW OPERATOR REGISTRATION"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg text-foreground font-mono-tech text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg text-foreground font-mono-tech text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg text-foreground font-mono-tech text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-lg bg-primary/20 border border-primary/40 text-primary font-display text-sm tracking-widest glow-blue hover:bg-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <span className="font-mono-tech">PROCESSING...</span>
              ) : (
                <>
                  {isLogin ? "AUTHENTICATE" : "REGISTER"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-mono-tech text-muted-foreground hover:text-primary transition-colors tracking-wider"
            >
              {isLogin ? "NEW OPERATOR? CREATE ACCOUNT" : "EXISTING OPERATOR? LOGIN"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
