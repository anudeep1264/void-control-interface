import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Mic, Image, Search, Workflow, ShieldCheck, Brain, Paperclip } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/vlad-editorial-hero.jpg";
import patternImage from "@/assets/vlad-editorial-pattern.jpg";

const capabilities = [
  { icon: Mic, label: "Voice", title: "Speak naturally", text: "A voice-first interface that listens, routes intent, and opens the right workspace." },
  { icon: Image, label: "Create", title: "Image studio", text: "Describe what you need and move directly into a focused generation workspace." },
  { icon: Search, label: "Research", title: "Inquiry, organized", text: "Route questions into a dedicated research surface without a traditional chat shell." },
  { icon: Workflow, label: "Automation", title: "Work in motion", text: "Coordinate actions and follow progress from a single calm operating surface." },
];

const Landing = () => (
  <div className="min-h-screen bg-background paper-texture">
    <Navbar />
    <section className="mx-auto grid min-h-[92vh] max-w-7xl items-center gap-10 px-5 pb-16 pt-28 sm:px-8 lg:grid-cols-[1.05fr_.95fr]">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }}>
        <p className="mb-5 text-xs font-semibold uppercase text-accent">Personal autonomous intelligence</p>
        <h1 className="max-w-3xl font-display text-5xl leading-[1.08] sm:text-6xl lg:text-7xl">Intelligence, held with <em className="font-normal text-primary">quiet attention.</em></h1>
        <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">VLAD Ω brings voice, memory, creation, research, and system awareness into one considered place.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg"><Link to="/ai-hub">Begin with voice <ArrowRight /></Link></Button>
          <Button asChild variant="outline" size="lg"><a href="#capabilities">Explore capabilities</a></Button>
        </div>
        <div className="mt-12 grid max-w-xl grid-cols-3 border-y py-5 text-sm">
          <span><strong className="block font-display text-lg">Voice-first</strong><small className="text-muted-foreground">Natural interaction</small></span>
          <span><strong className="block font-display text-lg">Private</strong><small className="text-muted-foreground">Per-user memory</small></span>
          <span><strong className="block font-display text-lg">Adaptive</strong><small className="text-muted-foreground">Intent workspaces</small></span>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} className="relative min-h-[520px]">
        <img src={heroImage} width={1200} height={1600} alt="Handmade paper, olive textile, and a brass bell" className="h-[540px] w-full rounded-md object-cover" />
        <div className="absolute -bottom-6 left-4 right-4 grid grid-cols-[1fr_auto] items-center gap-4 rounded-md border bg-card/95 p-4 shadow-xl sm:left-[-24px] sm:right-10">
          <span><small className="block text-xs uppercase text-accent">Presence</small><strong className="font-display text-lg">Ready when you are.</strong></span>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background"><Mic className="h-5 w-5" /></span>
        </div>
      </motion.div>
    </section>

    <section id="capabilities" className="border-y bg-card/45 px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-2xl"><p className="text-xs uppercase text-accent">A composed workspace</p><h2 className="mt-3 text-4xl sm:text-5xl">One intelligence. Many forms of work.</h2></div>
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {capabilities.map((item, i) => <article key={item.title} className={`mb-5 break-inside-avoid rounded-md border p-6 ${i === 1 ? "bg-primary text-primary-foreground" : "bg-card"}`}>
            <item.icon className="mb-10 h-5 w-5" /><small className="uppercase opacity-70">{item.label}</small><h3 className="mt-2 text-2xl">{item.title}</h3><p className="mt-3 text-sm leading-6 opacity-75">{item.text}</p>
          </article>)}
          <article className="mb-5 break-inside-avoid overflow-hidden rounded-md border bg-foreground text-background"><img loading="lazy" src={patternImage} width={1024} height={1280} alt="Olive and terracotta geometric paper artwork" className="h-64 w-full object-cover opacity-90" /><div className="p-6"><small className="uppercase text-secondary">Memory</small><h3 className="mt-2 text-2xl">Context that stays yours.</h3></div></article>
        </div>
      </div>
    </section>

    <section id="approach" className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2">
      <div><p className="text-xs uppercase text-accent">The approach</p><h2 className="mt-3 text-4xl sm:text-5xl">Less dashboard.<br /><em className="font-normal text-primary">More presence.</em></h2></div>
      <div className="space-y-8 text-muted-foreground"><p className="text-lg leading-8">The interface recedes until you need it. Speak, attach, or select a focused action; VLAD opens the appropriate workspace and keeps the system state legible.</p><div className="grid gap-4 sm:grid-cols-2"><div className="border-t pt-4"><Paperclip className="mb-3" /><strong className="text-foreground">Bring context</strong><p className="mt-1 text-sm">Attachments and prompts remain part of the task flow.</p></div><div className="border-t pt-4"><Brain className="mb-3" /><strong className="text-foreground">Recall selectively</strong><p className="mt-1 text-sm">Long-term memory remains private to each signed-in user.</p></div></div></div>
    </section>

    <section id="security" className="bg-primary px-5 py-20 text-primary-foreground sm:px-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-end"><div className="max-w-2xl"><ShieldCheck className="mb-5" /><h2 className="text-4xl">Security, without theatre.</h2><p className="mt-4 leading-7 opacity-75">Monitoring and security tools remain available, with status shown clearly and without invented performance claims.</p></div><Button asChild variant="secondary" size="lg"><Link to="/security-logs">View security <ArrowRight /></Link></Button></div></section>
    <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8"><span className="font-display text-foreground">VLAD Ω</span><span>Personal intelligence, thoughtfully composed.</span></footer>
  </div>
);

export default Landing;