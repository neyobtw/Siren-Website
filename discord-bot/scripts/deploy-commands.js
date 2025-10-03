import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID; // optional

// Build commands payload by importing from bot.js to keep in sync
async function buildCommands() {
  const { SlashCommandBuilder, PermissionFlagsBits } = await import('discord.js');
  const PRODUCT_KEYS = [
    'fortnite','fortnite_lite','rust','r6_full','r6_unlock_all','bo6_internal','valorant_colorbot','valorant_vip','valorant_external','marvel_rivals','apex_rekall','eft','temp_spoofer','perm_spoofer'
  ];
  const setStatus = new SlashCommandBuilder()
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
  return [setStatus.toJSON()];
}

async function main() {
  if (!TOKEN || !CLIENT_ID) {
    console.error('Missing DISCORD_TOKEN or CLIENT_ID in .env');
    process.exit(1);
  }
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  const body = await buildCommands();
  if (GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body });
    console.log('Deployed guild commands to', GUILD_ID);
  } else {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body });
    console.log('Deployed global commands');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
