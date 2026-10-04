import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => (
  <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/92 backdrop-blur-md">
    <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
      <Link to="/" className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/40 font-display text-lg text-primary">Ω</span>
        <span className="font-display text-lg">VLAD</span>
      </Link>
      <div className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
        <a href="#capabilities" className="hover:text-foreground">Capabilities</a>
        <a href="#approach" className="hover:text-foreground">Approach</a>
        <a href="#security" className="hover:text-foreground">Security</a>
      </div>
      <Button asChild size="sm"><Link to="/ai-hub">Open VLAD <ArrowUpRight /></Link></Button>
    </nav>
  </header>
);

export default Navbar;