import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Orbit, ArrowRight } from "lucide-react";

const links = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "System", href: "#system" },
  { label: "Demo", href: "#demo" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <nav
          className={`flex items-center justify-between rounded-full px-5 py-2.5 transition-all duration-500 ${
            scrolled ? "glass-strong shadow-[0_8px_32px_-12px_hsl(215_80%_2%_/_0.6)]" : "bg-transparent border border-transparent"
          }`}
        >
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-md group-hover:bg-primary/50 transition-all" />
              <Orbit className="w-5 h-5 text-primary relative" />
            </div>
            <span className="font-display font-bold text-base tracking-tight">VLAD</span>
            <span className="hidden sm:inline text-[10px] font-mono-tech text-muted-foreground tracking-[0.2em] uppercase pl-2 border-l border-border/60">
              v5.0
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full"
              >
                {l.label}
              </a>
            ))}
          </div>

          <Link
            to="/dashboard"
            className="btn-primary-glow inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold"
          >
            Launch
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </nav>
      </div>
    </motion.header>
  );
};

export default Navbar;
