# Discord Message Forwarder Bot

Forwards messages from your **live-alerts** channel to **himothy-alerts** and **himothy-trades** channels in other servers.

## Setup on Replit

1. Create a new Replit project (Node.js template)
2. Import this repo (or paste index.js)
3. Run `npm install` in the Shell
4. Add your bot token as a Secret: `DISCORD_TOKEN`
5. Click Run

## Getting Your Bot Token

1. Go to https://discord.com/developers/applications
2. Select your bot (or create one)
3. Go to the **Bot** tab
4. Click **Reset Token** and copy it
5. Turn ON **Message Content Intent**
6. Paste the token as `DISCORD_TOKEN` in Replit Secrets

## Inviting the Bot

1. Go to your bot's app on Discord Developer Portal
2. Go to **OAuth2** > **URL Generator**
3. Select scopes: `bot`
4. Select permissions: `Send Messages`, `Read Message History`, `View Channels`
5. Copy the URL and open it to invite the bot to your servers

## Customization

Edit the settings at the top of `index.js` to change channel names.
