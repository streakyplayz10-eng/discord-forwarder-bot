import { useBotConfig, useUpdateBotConfig } from "@/hooks/use-bot-config";
import { useLogs } from "@/hooks/use-logs";
import { StatsCard } from "@/components/StatsCard";
import { Activity, MessageSquare, Power, Settings2, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Home() {
  const { data: config, isLoading: isConfigLoading } = useBotConfig();
  const { data: logs, isLoading: isLogsLoading } = useLogs();
  const updateConfig = useUpdateBotConfig();

  if (isConfigLoading || isLogsLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Initializing dashboard...</p>
        </div>
      </div>
    );
  }

  const toggleBot = () => {
    if (config) {
      updateConfig.mutate({ isEnabled: !config.isEnabled });
    }
  };

  const recentLogs = logs?.slice(0, 5) || [];
  const successCount = logs?.filter(l => l.status === 'success').length || 0;
  
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 md:pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your Discord bot activity</p>
        </div>
        <button
          onClick={toggleBot}
          disabled={updateConfig.isPending}
          className={`
            flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all duration-300
            ${config?.isEnabled 
              ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20' 
              : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'}
          `}
        >
          <Power className="w-4 h-4" />
          {config?.isEnabled ? "System Active" : "System Offline"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Messages"
          value={logs?.length || 0}
          icon={<MessageSquare className="w-5 h-5" />}
          trend="+12%"
          trendUp={true}
        />
        <StatsCard
          title="Success Rate"
          value={`${logs?.length ? Math.round((successCount / logs.length) * 100) : 0}%`}
          icon={<Activity className="w-5 h-5" />}
          trend="Stable"
          trendUp={true}
        />
        <StatsCard
          title="Source Channel"
          value={config?.sourceChannel || "Not Set"}
          icon={<Settings2 className="w-5 h-5" />}
          className="lg:col-span-2"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Recent Activity</h2>
            <Link href="/logs">
              <span className="text-xs font-medium text-primary hover:text-primary/80 cursor-pointer flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>

          <div className="space-y-4">
            {recentLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl bg-black/10">
                <p>No messages forwarded yet.</p>
              </div>
            ) : (
              recentLogs.map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-border/50"
                >
                  <div className={`
                    mt-1 w-2 h-2 rounded-full shrink-0
                    ${log.status === 'success' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}
                  `} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-white truncate">
                        Forwarded from <span className="text-primary">{log.sourceGuild}</span>
                      </p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap font-mono">
                        {log.createdAt && formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2 font-mono bg-black/20 p-2 rounded-lg border border-white/5">
                      {log.content}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Configuration Quick View */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 flex flex-col">
          <h2 className="text-lg font-bold text-white mb-6">Configuration</h2>
          
          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Source Channel</label>
              <div className="p-3 bg-black/20 rounded-lg border border-white/5 text-sm font-mono text-white">
                #{config?.sourceChannel}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Target Channels</label>
              <div className="space-y-2">
                <div className="p-3 bg-black/20 rounded-lg border border-white/5 text-sm font-mono text-white flex items-center justify-between">
                  <span>#{config?.targetChannel1}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                </div>
                <div className="p-3 bg-black/20 rounded-lg border border-white/5 text-sm font-mono text-white flex items-center justify-between">
                  <span>#{config?.targetChannel2}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                </div>
              </div>
            </div>
          </div>

          <Link href="/settings">
            <button className="w-full mt-6 py-3 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300">
              Edit Configuration
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
