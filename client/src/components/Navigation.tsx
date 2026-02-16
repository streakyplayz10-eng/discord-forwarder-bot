import { Link, useLocation } from "wouter";
import { LayoutDashboard, Settings, Activity, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/logs", label: "Live Logs", icon: Terminal },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="flex flex-col h-full bg-card/50 backdrop-blur-md border-r border-border w-64 p-4 hidden md:flex">
      <div className="flex items-center gap-3 px-2 mb-8 mt-2">
        <div className="bg-primary/20 p-2 rounded-xl">
          <Activity className="w-6 h-6 text-primary animate-pulse" />
        </div>
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          BotControl
        </h1>
      </div>

      <div className="space-y-1">
        {links.map((link) => {
          const isActive = location === link.href;
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-muted-foreground group-hover:text-white")} />
                {link.label}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto px-4 py-4 bg-black/20 rounded-xl border border-white/5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          System Online
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground/60 uppercase tracking-wider font-mono">
          v1.0.4 Stable
        </p>
      </div>
    </nav>
  );
}

export function MobileNav() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/logs", label: "Logs", icon: Terminal },
    { href: "/settings", label: "Config", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-lg border-t border-border z-50 md:hidden pb-safe">
      <div className="flex justify-around items-center p-2">
        {links.map((link) => {
          const isActive = location === link.href;
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors duration-200 cursor-pointer",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-white"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "fill-current/20")} />
                <span className="text-[10px] font-medium">{link.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
