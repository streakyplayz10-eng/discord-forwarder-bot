# Discord Message Forwarder Bot

Forwards messages from your **live-alerts** channel to **himothy-alerts** and **himothy-trades** channels in other servers.

## Deploy on Railway

1. Connect this GitHub repo to Railway
2. Go to **Settings > Variables**
3. Add: `DISCORD_TOKEN` = your bot token
4. Railway will auto-deploy

## Deploy on Replit

1. Create a new Node.js Replit
2. Import this repo
3. Add `DISCORD_TOKEN` in the Secrets tab
4. Click Run

## Getting Your Bot Token

1. Go to https://discord.com/developers/applications
2. Select your bot (or create one)
3. Go to the **Bot** tab
4. Click **Reset Token** and copy it
5. Turn ON **Message Content Intent**
6. Use the token as `DISCORD_TOKEN`

## Inviting the Bot

1. Go to your bot's app on Discord Developer Portal
2. Go to **OAuth2** > **URL Generator**
3. Select scopes: `bot`
4. Select permissions: `Send Messages`, `Read Message History`, `View Channels`
5. Copy the URL and open it to invite the bot

## Customization

Edit the settings at the top of `index.js` to change channel names.
