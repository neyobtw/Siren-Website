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
const STATUS_PATH = path.resolve(__dirname, '..', 'Fractal.Assets2', 'status.json');

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

function loadStatus() {
  try {
    const raw = fs.readFileSync(STATUS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return { lastUpdated: null, products: {} };
  }
}

function saveStatus(status) {
  status.lastUpdated = new Date().toISOString();
  fs.writeFileSync(STATUS_PATH, JSON.stringify(status, null, 2));
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

  const data = loadStatus();
  if (!data.products[product]) data.products[product] = {};
  data.products[product].status = statusLabel;
  data.products[product].available = available;
  saveStatus(data);

  await interaction.reply({ content: `Updated ${product}: status=${statusLabel}, available=${available}`, ephemeral: true });
});

if (!TOKEN || !CLIENT_ID) {
  console.error('Missing DISCORD_TOKEN or CLIENT_ID in .env');
  process.exit(1);
}

client.login(TOKEN);
