# Rekall Status Discord Bot

A minimal, secure Discord bot to update product status/availability for the website. The bot writes to a shared JSON file that the web pages read at runtime.

## Files
- `bot.js`: Main bot. Registers `/setstatus` and handles updates.
- `scripts/deploy-commands.js`: One-off script to (re)deploy slash commands.
- `.env.example`: Template for environment variables.
- Website reads from: `../Fractal.Assets2/status.json`.

## Prerequisites
- Node.js 18+
- A Discord application and bot token: https://discord.com/developers/applications
- Permissions: The bot must be invited to your server with the `applications.commands` and basic bot scopes.

## Setup
1. Copy `.env.example` to `.env` and fill in:
```
DISCORD_TOKEN=your-bot-token
CLIENT_ID=your-application-id
# optional for faster iteration
GUILD_ID=your-guild-id
# optional allowlists (comma-separated IDs)
ALLOWED_ROLE_IDS=roleId1,roleId2
ALLOWED_USER_IDS=userId1,userId2
```

2. Install dependencies:
```
npm install
```

3. Deploy slash commands (recommended initially):
```
# guild-scoped (fast): requires GUILD_ID in .env
npm run deploy:commands
# or global (slow to appear):
# remove GUILD_ID and run the same command
```

4. Start the bot:
```
npm start
```

## Usage
In Discord:
```
/setstatus product:<key> status:<UNDETECTED|UPDATING|DETECTED> available:<true|false>
```
This writes to `../Fractal.Assets2/status.json` and updates:
- `products.html`: blocks purchase and shows "This product is not available" toast if `available=false`; updates card badge color/text.
- `status.html`: updates status badges.

## Product keys
Use one of:
```
fortnite, fortnite_lite, rust, r6_full, r6_unlock_all, bo6_internal,
valorant_colorbot, valorant_vip, valorant_external,
marvel_rivals, apex_rekall, eft, temp_spoofer, perm_spoofer
```

## Security
- Only Administrators can use `/setstatus` by default (defaultMemberPermissions).
- Additionally, you can restrict to explicit roles/users with `ALLOWED_ROLE_IDS` and `ALLOWED_USER_IDS`.
- No secrets stored in code; everything in `.env`.

## Notes
- Web pages fetch `status.json` on load; after changing a status in Discord, refresh the site to reflect changes.
- If you rename product titles in HTML, update the mapping in `products.html` and `status.html` scripts to keep keys aligned.
