import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatsCard({ title, value, icon, trend, trendUp, className }: StatsCardProps) {
  return (
    <div className={cn(
      "bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 hover:border-primary/30 transition-all duration-300 group",
      className
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
          {icon}
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full border",
            trendUp 
              ? "bg-green-500/10 text-green-400 border-green-500/20" 
              : "bg-red-500/10 text-red-400 border-red-500/20"
          )}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-1 tracking-tight">{value}</h3>
      </div>
    </div>
  );
}
