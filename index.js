// ===== DISCORD MESSAGE FORWARDER BOT =====
// 
// HOW TO USE:
// 1. Create a new Replit project (Node.js template)
// 2. Paste this entire file as "index.js"
// 3. In the Shell tab, run: npm install discord.js
// 4. In the Secrets tab, add: DISCORD_TOKEN = your bot token
// 5. Click Run
//
// SETUP YOUR BOT TOKEN:
// 1. Go to https://discord.com/developers/applications
// 2. Click your bot (or create one)
// 3. Go to "Bot" tab
// 4. Click "Reset Token" and copy it
// 5. Make sure "MESSAGE CONTENT INTENT" is turned ON
// 6. Paste the token as DISCORD_TOKEN in Replit Secrets
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

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

// Flexible matching - ignores emojis and extra dashes in channel names
function channelMatches(channelName, target) {
  if (channelName === target) return true;
  const clean = channelName.replace(/[^\w-]/g, '').replace(/^-+/, '');
  if (clean === target) return true;
  if (channelName.includes(target)) return true;
  return false;
}

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
  // Ignore bot messages
  if (message.author.bot) return;

  // Check if message is in the source channel
  if (!channelMatches(message.channel.name, SOURCE_CHANNEL)) return;

  console.log(`[NEW] Message from ${message.author.tag} in ${message.guild.name}#${message.channel.name}`);
  console.log(`  Content: ${message.content.substring(0, 100)}`);

  let sent = 0;
  let failed = 0;

  // Forward to all matching channels in other servers
  for (const guild of client.guilds.cache.values()) {
    // Skip the server where the message came from
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

// Login
const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('ERROR: No DISCORD_TOKEN found!');
  console.error('Go to the Secrets tab and add DISCORD_TOKEN with your bot token.');
  process.exit(1);
}

client.login(token).catch(err => {
  console.error('Failed to login:', err.message);
  console.error('Make sure your DISCORD_TOKEN is a valid bot token.');
  console.error('Go to https://discord.com/developers/applications > your bot > Bot tab > Reset Token');
  process.exit(1);
});
