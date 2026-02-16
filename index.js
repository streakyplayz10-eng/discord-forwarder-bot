// ===== DISCORD MESSAGE FORWARDER BOT =====
// 
// HOW TO USE:
// 1. Deploy to Railway, Replit, or any Node.js host
// 2. Set the DISCORD_TOKEN environment variable to your bot token
// 3. Start the bot with: node index.js
//
// OPTIONAL ENVIRONMENT VARIABLES:
//   SOURCE_CHANNEL - channel name keyword to watch (default: "external-feed")
//   SOURCE_CHANNEL_ID - exact channel ID to watch (overrides name matching if set)
//
// ==========================================

const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const http = require('http');

const SOURCE_SERVER = 'Liquidity Lab';
const SOURCE_CHANNEL_KEYWORD = process.env.SOURCE_CHANNEL || 'external-feed';
const SOURCE_CHANNEL_ID = process.env.SOURCE_CHANNEL_ID || '';
const TARGET_CHANNELS = [
  'himothy-alerts',
  'himothy-trades'
];

function channelMatches(channelName, target) {
  if (channelName === target) return true;
  const clean = channelName.replace(/[^\w-]/g, '').replace(/^-+/, '');
  if (clean === target) return true;
  if (channelName.includes(target)) return true;
  const cleanTarget = target.replace(/[^\w-]/g, '').replace(/^-+/, '');
  if (clean === cleanTarget) return true;
  if (clean.includes(cleanTarget)) return true;
  return false;
}

function isSourceChannel(channel) {
  if (SOURCE_CHANNEL_ID && channel.id === SOURCE_CHANNEL_ID) return true;
  return channelMatches(channel.name, SOURCE_CHANNEL_KEYWORD);
}

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('ERROR: DISCORD_TOKEN environment variable is not set!');
  console.error('Set it in Railway: Variables tab > Add DISCORD_TOKEN');
  process.exit(1);
} else {
  startBot(token);
}

function startBot(botToken) {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ]
  });

  let sourceChannelId = SOURCE_CHANNEL_ID;

  client.on('ready', async () => {
    console.log(`Bot is online as ${client.user.tag}`);
    console.log(`Source server: "${SOURCE_SERVER}"`);
    console.log(`Source channel keyword: "${SOURCE_CHANNEL_KEYWORD}"`);
    if (SOURCE_CHANNEL_ID) console.log(`Source channel ID (override): ${SOURCE_CHANNEL_ID}`);
    console.log(`Forwarding to channels matching: ${TARGET_CHANNELS.join(', ')}`);
    console.log(`Connected to ${client.guilds.cache.size} servers:`);

    for (const guild of client.guilds.cache.values()) {
      try {
        const channels = await guild.channels.fetch();
        const textChannels = channels.filter(c => c && c.type === ChannelType.GuildText);
        console.log(`  ${guild.name}:`);
        textChannels.forEach(c => {
          if (c) {
            const marker = isSourceChannel(c) ? ' <-- SOURCE' : '';
            console.log(`    #${c.name} (ID: ${c.id})${marker}`);
            if (marker && !sourceChannelId) {
              sourceChannelId = c.id;
              console.log(`    ^ Locked to this channel ID: ${c.id} (rename-proof)`);
            }
          }
        });
      } catch (e) {
        console.log(`  ${guild.name}: (could not list channels)`);
      }
    }
    console.log('---');
    console.log('Bot is ready and listening!');
    if (sourceChannelId) {
      console.log(`Tracking source channel by ID: ${sourceChannelId} (renaming won't break forwarding)`);
    }
  });

  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const matchById = sourceChannelId && message.channel.id === sourceChannelId;
    const matchByName = isSourceChannel(message.channel);

    if (!matchById && !matchByName) return;

    if (!sourceChannelId && matchByName) {
      sourceChannelId = message.channel.id;
      console.log(`Locked source channel ID: ${message.channel.id} (${message.channel.name})`);
    }

    console.log(`[NEW] Message from ${message.author.tag} in ${message.guild?.name}#${message.channel.name}`);
    console.log(`  Content: ${message.content.substring(0, 100)}`);

    let sent = 0;
    let failed = 0;

    for (const guild of client.guilds.cache.values()) {
      if (guild.id === message.guildId) continue;

      try {
        const channels = await guild.channels.fetch();

        for (const targetName of TARGET_CHANNELS) {
          const target = channels.find(
            c => c && c.type === ChannelType.GuildText && channelMatches(c.name, targetName)
          );

          if (target) {
            try {
              await target.send({
                content: message.content,
                files: message.attachments.map(a => a.url)
              });
              console.log(`  [OK] -> ${guild.name}#${target.name}`);
              sent++;
            } catch (err) {
              console.log(`  [FAIL] -> ${guild.name}#${target.name}: ${err.message}`);
              failed++;
            }
          }
        }
      } catch (err) {
        console.log(`  [FAIL] Could not access ${guild.name}: ${err.message}`);
        failed++;
      }
    }

    console.log(`  Result: ${sent} sent, ${failed} failed`);
  });

  client.on('error', (err) => {
    console.error('Discord client error:', err.message);
  });

  client.login(botToken).catch(err => {
    console.error('Failed to login:', err.message);
    process.exit(1);
  });

  const port = process.env.PORT || 3000;
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Bot is running. Status: ${client.isReady() ? 'Online' : 'Connecting...'}\nSource channel ID: ${sourceChannelId || 'detecting...'}`);
  });
  server.listen(port, '0.0.0.0', () => {
    console.log(`Health check server running on port ${port}`);
  });
}
