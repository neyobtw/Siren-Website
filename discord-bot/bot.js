import 'dotenv/config';
import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config
const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID; // optional for guild-only registration
const CLIENT_ID = process.env.CLIENT_ID; // your application (bot) id
const ALLOWED_ROLE_IDS = (process.env.ALLOWED_ROLE_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
const ALLOWED_USER_IDS = (process.env.ALLOWED_USER_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
// GitHub repo config for remote status updates
const GH_OWNER = process.env.GITHUB_REPO_OWNER;          // e.g., "neyobtw"
const GH_REPO = process.env.GITHUB_REPO_NAME;            // e.g., "Siren-Website"
const GH_PATH = process.env.STATUS_FILE_PATH || 'Fractal.Assets2/status.json';
const GH_BRANCH = process.env.STATUS_BRANCH || 'main';
const GH_TOKEN = process.env.GITHUB_TOKEN;               // PAT with repo scope

// Product keys mapping (status.json keys)
const PRODUCT_KEYS = [
  'fortnite',
  'fortnite_lite',
  'rust',
  'r6_full',
  'r6_unlock_all',
  'bo6_internal',
  'valorant_colorbot',
  'valorant_vip',
  'valorant_external',
  'marvel_rivals',
  'apex_rekall',
  'eft',
  'temp_spoofer',
  'perm_spoofer'
];

// ---- GitHub-backed status storage ----
async function githubGetStatus() {
  if (!GH_OWNER || !GH_REPO || !GH_TOKEN) {
    // Fallback to local file if present (useful for dev)
    try {
      const localPath = path.resolve(__dirname, '..', 'Fractal.Assets2', 'status.json');
      const raw = fs.readFileSync(localPath, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return { lastUpdated: null, products: {} };
    }
  }
  const url = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${encodeURIComponent(GH_PATH)}?ref=${GH_BRANCH}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${GH_TOKEN}`, 'User-Agent': 'status-bot', 'Accept': 'application/vnd.github+json' } });
  if (!res.ok) return { lastUpdated: null, products: {} };
  const data = await res.json();
  try {
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    return JSON.parse(content);
  } catch {
    return { lastUpdated: null, products: {} };
  }
}

async function githubSaveStatus(statusObj) {
  statusObj.lastUpdated = new Date().toISOString();

  if (!GH_OWNER || !GH_REPO || !GH_TOKEN) {
    // Fallback to local write (dev only)
    const localPath = path.resolve(__dirname, '..', 'Fractal.Assets2', 'status.json');
    fs.writeFileSync(localPath, JSON.stringify(statusObj, null, 2));
    return;
  }

  // Get existing sha if file exists
  let sha;
  const getUrl = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${encodeURIComponent(GH_PATH)}?ref=${GH_BRANCH}`;
  const getRes = await fetch(getUrl, { headers: { Authorization: `Bearer ${GH_TOKEN}`, 'User-Agent': 'status-bot', 'Accept': 'application/vnd.github+json' } });
  if (getRes.ok) {
    const existing = await getRes.json();
    sha = existing.sha;
  }

  const putUrl = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${encodeURIComponent(GH_PATH)}`;
  const body = {
    message: `chore(status): update ${GH_PATH}`,
    content: Buffer.from(JSON.stringify(statusObj, null, 2)).toString('base64'),
    sha,
    branch: GH_BRANCH,
    committer: { name: 'Status Bot', email: 'bot@example.com' }
  };
  const putRes = await fetch(putUrl, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${GH_TOKEN}`, 'User-Agent': 'status-bot', 'Content-Type': 'application/json', 'Accept': 'application/vnd.github+json' },
    body: JSON.stringify(body)
  });
  if (!putRes.ok) {
    const err = await putRes.text();
    throw new Error(`GitHub update failed: ${putRes.status} ${err}`);
  }
  const result = await putRes.json();
  return {
    commitUrl: result && result.commit && result.commit.html_url ? result.commit.html_url : null,
    contentSha: result && result.content && result.content.sha ? result.content.sha : null
  };
}

function isAuthorized(interaction) {
  if (ALLOWED_USER_IDS.includes(interaction.user.id)) return true;
  const member = interaction.member;
  if (!member) return false;
  if (ALLOWED_ROLE_IDS.length === 0) return false;
  return member.roles.cache.some(r => ALLOWED_ROLE_IDS.includes(r.id));
}

const setStatusCommand = new SlashCommandBuilder()
  .setName('setstatus')
  .setDescription('Update a product\'s status and availability')
  .addStringOption(o => o.setName('product').setDescription('Product key').setRequired(true).addChoices(
    ...PRODUCT_KEYS.map(k => ({ name: k, value: k }))
  ))
  .addStringOption(o => o.setName('status').setDescription('Status label').setRequired(true).addChoices(
    { name: 'UNDETECTED', value: 'UNDETECTED' },
    { name: 'UPDATING', value: 'UPDATING' },
    { name: 'DETECTED', value: 'DETECTED' }
  ))
  .addBooleanOption(o => o.setName('available').setDescription('Is purchasable?').setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

async function deployCommands() {
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  const body = [setStatusCommand.toJSON()];
  if (GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body });
  } else {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body });
  }
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  try {
    await deployCommands();
    console.log('Commands deployed. Bot ready as', client.user.tag);
  } catch (e) {
    console.error('Failed to deploy commands', e);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'setstatus') return;

  if (!isAuthorized(interaction)) {
    await interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: true });
    return;
  }

  const product = interaction.options.getString('product', true);
  const statusLabel = interaction.options.getString('status', true);
  const available = interaction.options.getBoolean('available', true);

  try {
    const data = await githubGetStatus();
    if (!data.products) data.products = {};
    if (!data.products[product]) data.products[product] = {};
    data.products[product].status = statusLabel;
    data.products[product].available = available;
    const res = await githubSaveStatus(data);
    const msg = `Updated ${product}: status=${statusLabel}, available=${available}` + (res.commitUrl ? `\nCommit: ${res.commitUrl}` : '');
    await interaction.reply({ content: msg, ephemeral: true });
  } catch (e) {
    console.error('Failed to update status:', e);
    await interaction.reply({ content: `Failed to update status: ${e.message || e}`, ephemeral: true });
  }
});

if (!TOKEN || !CLIENT_ID) {
  console.error('Missing DISCORD_TOKEN or CLIENT_ID in .env');
  process.exit(1);
}

client.login(TOKEN);
