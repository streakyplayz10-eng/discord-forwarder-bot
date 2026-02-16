import { useLogs } from "@/hooks/use-logs";
import { format } from "date-fns";
import { Terminal, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Logs() {
  const { data: logs, isLoading } = useLogs();

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <Terminal className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">System Logs</h1>
          <p className="text-muted-foreground">Real-time forwarding history</p>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-white/5">
                <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">Status</th>
                <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider w-48">Time</th>
                <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider w-48">Source</th>
                <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Message Content</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {logs?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    No logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs?.map((log, i) => (
                  <motion.tr 
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      {log.status === 'success' ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-xs font-medium">Success</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">Failed</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground font-mono whitespace-nowrap">
                      {log.createdAt && format(new Date(log.createdAt), "MMM d, HH:mm:ss")}
                    </td>
                    <td className="p-4 text-sm text-white font-medium">
                      {log.sourceGuild}
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-muted-foreground font-mono bg-black/20 p-2 rounded border border-white/5 max-w-2xl overflow-hidden text-ellipsis whitespace-nowrap group-hover:whitespace-normal group-hover:break-words transition-all">
                        {log.content}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
