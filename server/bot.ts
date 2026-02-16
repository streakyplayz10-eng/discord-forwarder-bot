import { Client, GatewayIntentBits, Message, TextChannel, ChannelType } from "discord.js";
import { storage } from "./storage";

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    if (process.env.DISCORD_TOKEN) return process.env.DISCORD_TOKEN;
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  try {
    connectionSettings = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=discord',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    ).then(res => res.json()).then(data => data.items?.[0]);
  } catch (e) {
    console.warn("Failed to fetch connection settings:", e);
  }

  if (process.env.DISCORD_TOKEN) {
    return process.env.DISCORD_TOKEN;
  }

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings && !process.env.DISCORD_TOKEN) {
    throw new Error('Discord not connected: connectionSettings is null and DISCORD_TOKEN is missing');
  }

  if (!accessToken) {
    throw new Error('Discord not connected: accessToken is null');
  }
  return accessToken;
}

export async function getUncachableDiscordClient() {
  const token = await getAccessToken();

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ]
  });

  try {
    await client.login(token);
  } catch (err: any) {
    console.error("Login failed. Ensure you are using a BOT token, not an OAuth2 Bearer token.");
    throw err;
  }
  return client;
}

function channelNameMatches(channelName: string, configName: string): boolean {
  if (channelName === configName) return true;
  const stripped = channelName.replace(/[^\w-]/g, '').replace(/^-+/, '');
  const configStripped = configName.replace(/[^\w-]/g, '').replace(/^-+/, '');
  if (stripped === configStripped) return true;
  if (channelName.endsWith(configName)) return true;
  if (channelName.includes(configName)) return true;
  return false;
}

let client: Client | null = null;

export async function startDiscordBot() {
  if (client) return client;

  try {
    console.log("Initializing Discord client...");
    client = await getUncachableDiscordClient();

    client.on("ready", async () => {
      console.log(`Logged in as ${client?.user?.tag}!`);
      console.log(`Bot is in ${client?.guilds.cache.size} guilds:`);
      
      for (const guild of client!.guilds.cache.values()) {
        try {
          const channels = await guild.channels.fetch();
          const textChannels = channels.filter(c => c?.type === ChannelType.GuildText);
          console.log(` - ${guild.name} (${textChannels.size} text channels):`);
          textChannels.forEach(c => {
            if (c) console.log(`     #${c.name}`);
          });
        } catch (e) {
          console.log(` - ${guild.name} (could not fetch channels)`);
        }
      }
    });

    client.on("messageCreate", async (message: Message) => {
      if (message.author.bot) return;

      const config = await storage.getBotConfig();
      if (!config || !config.isEnabled) return;

      const channel = message.channel as TextChannel;

      if (!channelNameMatches(channel.name, config.sourceChannel)) return;

      console.log(`[MATCH] Message in #${channel.name} from ${message.author.tag}: ${message.content.substring(0, 100)}`);

      const targetChannels = [config.targetChannel1, config.targetChannel2];
      const forwardedTo: string[] = [];
      const errors: string[] = [];

      for (const guild of client!.guilds.cache.values()) {
        if (guild.id === message.guildId) continue;

        for (const targetName of targetChannels) {
          if (!targetName) continue;
          
          try {
            const channels = await guild.channels.fetch();
            const target = channels.find(
              (c) => c !== null && c.type === ChannelType.GuildText && channelNameMatches(c.name, targetName)
            ) as TextChannel | undefined;

            if (target) {
              const contentToSend = message.content;
              const attachments = message.attachments.map(a => a.url);
              
              await target.send({
                content: contentToSend,
                files: attachments.length > 0 ? attachments : undefined
              });
              forwardedTo.push(`${guild.name}#${target.name}`);
              console.log(`[OK] -> ${guild.name}#${target.name}`);
            }
          } catch (error: any) {
            const errMsg = `${guild.name}#${targetName}: ${error.message}`;
            errors.push(errMsg);
            console.error(`[FAIL] ${errMsg}`);
          }
        }
      }

      if (errors.length > 0) {
        console.log(`[ERRORS] ${errors.join(', ')}`);
      }

      const logStatus = forwardedTo.length > 0 ? (errors.length > 0 ? "partial" : "success") : "failed";
      console.log(`[LOG] Status: ${logStatus}, Forwarded to: ${forwardedTo.join(', ') || 'none'}`);

      await storage.createMessageLog({
        content: message.content.substring(0, 500),
        sourceGuild: message.guild?.name || "Unknown",
        targetGuilds: JSON.stringify(forwardedTo),
        status: logStatus
      });
    });

    return client;
  } catch (error) {
    console.error("Error starting bot:", error);
  }
}
