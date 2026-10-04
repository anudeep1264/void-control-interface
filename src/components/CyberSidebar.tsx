import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Brain, Clock, User, ShieldCheck, Settings, LogOut, Activity, ShieldAlert, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Brain, label: "VLAD Ω", path: "/ai-hub" },
  { icon: Activity, label: "Monitor", path: "/monitor" },
  { icon: ShieldAlert, label: "SOC", path: "/soc" },
  { icon: Clock, label: "Ledger", path: "/history" },
  { icon: User, label: "Account", path: "/account" },
  { icon: ShieldCheck, label: "Security", path: "/security-logs" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const CyberSidebar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const go = (path: string) => { navigate(path); setOpen(false); };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:hidden">
        <button onClick={() => go("/ai-hub")} className="flex items-center gap-2" aria-label="Open VLAD">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/40 font-display text-lg text-primary">Ω</span>
          <span className="font-display text-base">VLAD</span>
        </button>
        <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"}>
          {open ? <X /> : <Menu />}
        </Button>
      </header>

      {open && <button className="fixed inset-0 z-40 bg-foreground/20 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation" />}
      <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col border-r bg-sidebar p-5 transition-transform lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:translate-x-0", open && "translate-x-0")}>
        <button onClick={() => go("/ai-hub")} className="mb-10 flex items-center gap-3 text-left">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-card font-display text-2xl text-primary">Ω</span>
          <span><strong className="block font-display text-lg">VLAD</strong><small className="text-[10px] uppercase text-muted-foreground">Personal intelligence</small></span>
        </button>
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return <Button key={item.path} variant="ghost" onClick={() => go(item.path)} className={cn("h-11 w-full justify-start rounded-md px-3 text-muted-foreground", active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground")}>
              <item.icon className="h-4 w-4" /><span>{item.label}</span>
            </Button>;
          })}
        </nav>
        <div className="mt-5 border-t pt-5">
          <p className="mb-3 flex items-center gap-2 text-xs text-primary"><span className="h-2 w-2 rounded-full bg-primary" /> Available</p>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={async () => { await signOut(); navigate("/auth"); }}><LogOut /> Sign out</Button>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-5 border-t bg-background/96 px-2 backdrop-blur lg:hidden">
        {navItems.slice(0, 5).map((item) => {
          const active = location.pathname === item.path;
          return <button key={item.path} onClick={() => go(item.path)} className={cn("flex flex-col items-center justify-center gap-1 text-[10px] text-muted-foreground", active && "text-primary")}><item.icon className="h-4 w-4" /><span>{item.label}</span></button>;
        })}
      </nav>
    </>
  );
};

export default CyberSidebar;