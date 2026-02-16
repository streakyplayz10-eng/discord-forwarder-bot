# Discord Message Forwarder Bot (Full App)

Full-stack Discord bot with web dashboard. Forwards messages from **live-alerts** to **himothy-alerts** and **himothy-trades**.

## Deploy on Railway

1. Connect this GitHub repo to Railway
2. Add these environment variables in Railway:
   - `DISCORD_TOKEN` - Your Discord bot token
   - `DATABASE_URL` - PostgreSQL connection string (Railway can provision one)
   - `SESSION_SECRET` - Any random string for session security
3. Set the start command to: `npm run start`
4. Deploy

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DISCORD_TOKEN | Yes | Discord bot token |
| DATABASE_URL | Yes | PostgreSQL connection URL |
| SESSION_SECRET | Yes | Random string for sessions |
| PORT | No | Server port (defaults to 5000) |

## Getting Your Bot Token

1. Go to https://discord.com/developers/applications
2. Select your bot > Bot tab > Reset Token
3. Turn ON **Message Content Intent**
4. Copy the token

## Local Development

```bash
npm install
npm run dev
```
