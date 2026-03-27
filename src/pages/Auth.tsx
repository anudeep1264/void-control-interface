import { useState } from "react";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Mail, ArrowRight, Shield, Chrome } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "@/hooks/use-toast";
import MatrixRain from "@/components/MatrixRain";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const Auth = () => {
  const { user, loading, signInWithOtp, verifyOtp } = useAuth();
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signInWithOtp(email);
      setOtpSent(true);
      toast({ title: "OTP SENT", description: "Check your email for the verification code." });
    } catch (err: any) {
      toast({ title: "ERROR", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;
    setSubmitting(true);
    try {
      await verifyOtp(email, otp);
      toast({ title: "ACCESS GRANTED", description: "Welcome, operator." });
    } catch (err: any) {
      toast({ title: "INVALID CODE", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setSubmitting(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast({ title: "ERROR", description: String(result.error), variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "ERROR", description: err.message, variant: "destructive" });
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
              {otpSent ? "ENTER VERIFICATION CODE" : "AUTHENTICATION PORTAL"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!otpSent ? (
              <motion.div key="email-step" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                {/* OTP Login */}
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-xs font-mono-tech text-muted-foreground tracking-wider">LOGIN WITH OTP</span>
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
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
                      <span className="font-mono-tech">SENDING...</span>
                    ) : (
                      <>
                        SEND OTP
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs font-mono-tech text-muted-foreground tracking-wider">OR REGISTER WITH</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Google Sign Up */}
                <motion.button
                  onClick={handleGoogleSignUp}
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-lg bg-muted border border-border text-foreground font-mono-tech text-sm tracking-wider hover:border-primary/40 hover:bg-muted/80 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <Chrome className="w-4 h-4 text-primary" />
                  SIGN UP WITH GOOGLE
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="otp-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <p className="text-sm font-mono-tech text-muted-foreground text-center">
                  Code sent to <span className="text-primary">{email}</span>
                </p>

                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="border-border bg-muted text-foreground" />
                      <InputOTPSlot index={1} className="border-border bg-muted text-foreground" />
                      <InputOTPSlot index={2} className="border-border bg-muted text-foreground" />
                      <InputOTPSlot index={3} className="border-border bg-muted text-foreground" />
                      <InputOTPSlot index={4} className="border-border bg-muted text-foreground" />
                      <InputOTPSlot index={5} className="border-border bg-muted text-foreground" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <motion.button
                  onClick={handleVerifyOtp}
                  disabled={submitting || otp.length < 6}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-lg bg-primary/20 border border-primary/40 text-primary font-display text-sm tracking-widest glow-blue hover:bg-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? "VERIFYING..." : "VERIFY & LOGIN"}
                </motion.button>

                <button
                  onClick={() => { setOtpSent(false); setOtp(""); }}
                  className="w-full text-xs font-mono-tech text-muted-foreground hover:text-primary transition-colors tracking-wider"
                >
                  ← USE DIFFERENT EMAIL
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
