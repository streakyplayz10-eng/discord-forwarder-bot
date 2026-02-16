import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) throw new Error('X_REPLIT_TOKEN not found');

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    { headers: { 'Accept': 'application/json', 'X_REPLIT_TOKEN': xReplitToken } }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;
  if (!connectionSettings || !accessToken) throw new Error('GitHub not connected');
  return accessToken;
}

function readFileContent(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

function collectFiles(dir: string, base: string, result: { path: string; content: string }[] = []): { path: string; content: string }[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(base, entry.name);
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.cache' || entry.name === '.config' || entry.name === '.local' || entry.name === 'dist') continue;
    if (entry.isDirectory()) {
      collectFiles(fullPath, relativePath, result);
    } else {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        result.push({ path: relativePath, content });
      } catch { }
    }
  }
  return result;
}

async function main() {
  const accessToken = await getAccessToken();
  const octokit = new Octokit({ auth: accessToken });

  const { data: user } = await octokit.users.getAuthenticated();
  const owner = user.login;
  const repoName = 'discord-forwarder-bot';

  console.log(`Pushing full app to ${owner}/${repoName}...`);

  const workspace = '/home/runner/workspace';

  const filesToPush: { path: string; content: string }[] = [];

  // Root config files
  const rootFiles = [
    'package.json', 'tsconfig.json', 'vite.config.ts', 'drizzle.config.ts',
    'tailwind.config.ts', 'postcss.config.js', 'components.json', 'standalone-bot.js'
  ];
  for (const f of rootFiles) {
    const fp = path.join(workspace, f);
    if (fs.existsSync(fp)) {
      filesToPush.push({ path: f, content: readFileContent(fp) });
    }
  }

  // Server files
  const serverDir = path.join(workspace, 'server');
  if (fs.existsSync(serverDir)) {
    collectFiles(serverDir, 'server', filesToPush);
  }

  // Client files
  const clientDir = path.join(workspace, 'client');
  if (fs.existsSync(clientDir)) {
    collectFiles(clientDir, 'client', filesToPush);
  }

  // Shared files
  const sharedDir = path.join(workspace, 'shared');
  if (fs.existsSync(sharedDir)) {
    collectFiles(sharedDir, 'shared', filesToPush);
  }

  // Add Railway-specific files
  filesToPush.push({
    path: 'Procfile',
    content: 'web: npm run start\n',
  });

  filesToPush.push({
    path: 'nixpacks.toml',
    content: '[phases.setup]\nnixPkgs = ["nodejs_20"]\n\n[phases.install]\ncmds = ["npm install"]\n\n[phases.build]\ncmds = ["npm run build"]\n\n[start]\ncmd = "npm run start"\n',
  });

  filesToPush.push({
    path: '.gitignore',
    content: 'node_modules\ndist\n.env\n.cache\n',
  });

  filesToPush.push({
    path: 'README.md',
    content: `# Discord Message Forwarder Bot (Full App)

Full-stack Discord bot with web dashboard. Forwards messages from **live-alerts** to **himothy-alerts** and **himothy-trades**.

## Deploy on Railway

1. Connect this GitHub repo to Railway
2. Add these environment variables in Railway:
   - \`DISCORD_TOKEN\` - Your Discord bot token
   - \`DATABASE_URL\` - PostgreSQL connection string (Railway can provision one)
   - \`SESSION_SECRET\` - Any random string for session security
3. Set the start command to: \`npm run start\`
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

\`\`\`bash
npm install
npm run dev
\`\`\`
`,
  });

  console.log(`Collected ${filesToPush.length} files to push`);

  // Push files in batches to avoid rate limits
  for (let i = 0; i < filesToPush.length; i++) {
    const file = filesToPush[i];
    let sha: string | undefined;
    try {
      const { data } = await octokit.repos.getContent({ owner, repo: repoName, path: file.path });
      if (!Array.isArray(data) && 'sha' in data) sha = data.sha;
    } catch { }

    try {
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo: repoName,
        path: file.path,
        message: `Update ${file.path}`,
        content: Buffer.from(file.content).toString('base64'),
        ...(sha ? { sha } : {}),
      });
      console.log(`[${i + 1}/${filesToPush.length}] ${file.path}`);
    } catch (err: any) {
      console.error(`[FAIL] ${file.path}: ${err.message}`);
    }
  }

  console.log(`\nDone! Full app pushed to:`);
  console.log(`https://github.com/${owner}/${repoName}`);
}

main().catch(console.error);
