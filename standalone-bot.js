// ===== DISCORD MESSAGE FORWARDER BOT =====
// 
// HOW TO USE:
// 1. Deploy to Railway, Replit, or any Node.js host
// 2. Set the DISCORD_TOKEN environment variable to your bot token
// 3. Start the bot with: node index.js
//
// SETUP YOUR BOT TOKEN:
// 1. Go to https://discord.com/developers/applications
// 2. Click your bot (or create one)
// 3. Go to "Bot" tab
// 4. Click "Reset Token" and copy it
// 5. Make sure "MESSAGE CONTENT INTENT" is turned ON
// 6. Set DISCORD_TOKEN in your host's environment variables
//
// ==========================================

const { Client, GatewayIntentBits, ChannelType } = require('discord.js');

// ---- SETTINGS (change these to match your channels) ----
const SOURCE_CHANNEL = 'live-alerts';        // channel name to watch (without emojis)
const TARGET_CHANNELS = [
  'himothy-alerts',                           // first channel to forward to
  'himothy-trades'                            // second channel to forward to
];
// ---------------------------------------------------------

function channelMatches(channelName, target) {
  if (channelName === target) return true;
  const clean = channelName.replace(/[^\w-]/g, '').replace(/^-+/, '');
  if (clean === target) return true;
  if (channelName.includes(target)) return true;
  return false;
}

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('==============================================');
  console.error('ERROR: DISCORD_TOKEN environment variable is not set!');
  console.error('');
  console.error('Please set it in your hosting platform:');
  console.error('  Railway: Settings > Variables > Add DISCORD_TOKEN');
  console.error('  Replit:  Secrets tab > Add DISCORD_TOKEN');
  console.error('');
  console.error('To get your token:');
  console.error('  1. Go to https://discord.com/developers/applications');
  console.error('  2. Select your bot > Bot tab > Reset Token');
  console.error('  3. Copy the token and paste it as DISCORD_TOKEN');
  console.error('==============================================');
  console.error('');
  console.error('Waiting for DISCORD_TOKEN to be set... (will retry every 30s)');

  setInterval(() => {
    if (process.env.DISCORD_TOKEN) {
      console.log('DISCORD_TOKEN detected! Restarting...');
      process.exit(0);
    }
    console.log('Still waiting for DISCORD_TOKEN...');
  }, 30000);
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

  client.on('ready', async () => {
    console.log(`Bot is online as ${client.user.tag}`);
    console.log(`Watching for messages in channels matching: "${SOURCE_CHANNEL}"`);
    console.log(`Forwarding to channels matching: ${TARGET_CHANNELS.join(', ')}`);
    console.log(`Connected to ${client.guilds.cache.size} servers:`);

    for (const guild of client.guilds.cache.values()) {
      try {
        const channels = await guild.channels.fetch();
        const textChannels = channels.filter(c => c && c.type === ChannelType.GuildText);
        console.log(`  ${guild.name}:`);
        textChannels.forEach(c => { if (c) console.log(`    #${c.name}`); });
      } catch (e) {
        console.log(`  ${guild.name}: (could not list channels)`);
      }
    }
    console.log('---');
    console.log('Bot is ready and listening!');
  });

  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!channelMatches(message.channel.name, SOURCE_CHANNEL)) return;

    console.log(`[NEW] Message from ${message.author.tag} in ${message.guild.name}#${message.channel.name}`);
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
    console.error('Make sure your DISCORD_TOKEN is valid.');
    console.error('Go to https://discord.com/developers/applications > your bot > Bot tab > Reset Token');
    process.exit(1);
  });
}
