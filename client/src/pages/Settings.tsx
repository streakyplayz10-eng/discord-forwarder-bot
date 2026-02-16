import { useBotConfig, useUpdateBotConfig } from "@/hooks/use-bot-config";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBotConfigSchema } from "@shared/schema";
import { z } from "zod";
import { Settings2, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

// Partial schema for updates
const updateSchema = insertBotConfigSchema.partial();
type FormData = z.infer<typeof updateSchema>;

export default function Settings() {
  const { toast } = useToast();
  const { data: config, isLoading } = useBotConfig();
  const updateConfig = useUpdateBotConfig();

  const form = useForm<FormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      sourceChannel: "",
      targetChannel1: "",
      targetChannel2: "",
    },
  });

  // Load initial values
  useEffect(() => {
    if (config) {
      form.reset({
        sourceChannel: config.sourceChannel,
        targetChannel1: config.targetChannel1,
        targetChannel2: config.targetChannel2,
      });
    }
  }, [config, form]);

  const onSubmit = (data: FormData) => {
    updateConfig.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Configuration Saved",
          description: "Bot settings have been successfully updated.",
          className: "bg-green-500 border-none text-white",
        });
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto pb-24 md:pb-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <Settings2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Bot Configuration</h1>
          <p className="text-muted-foreground">Manage channels and routing rules</p>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 md:p-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full"></span>
              Source Settings
            </h3>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">Source Channel Name</label>
              <p className="text-xs text-muted-foreground/60 mb-1">The channel the bot listens to for new messages.</p>
              <input
                {...form.register("sourceChannel")}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                placeholder="e.g. live-alerts"
              />
              {form.formState.errors.sourceChannel && (
                <span className="text-xs text-red-400">{form.formState.errors.sourceChannel.message}</span>
              )}
            </div>
          </div>

          <div className="h-px bg-border/50 w-full" />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-green-500 rounded-full"></span>
              Target Settings
            </h3>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">Alerts Channel</label>
              <input
                {...form.register("targetChannel1")}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                placeholder="e.g. himothy-alerts"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">Trades Channel</label>
              <input
                {...form.register("targetChannel2")}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                placeholder="e.g. himothy-trades"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={updateConfig.isPending}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
            >
              {updateConfig.isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => form.reset()}
              disabled={updateConfig.isPending}
              className="px-6 py-3 rounded-xl border border-white/10 text-muted-foreground hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2 font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
