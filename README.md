# HellTickets

> Advanced multi-group Discord ticket bot with modal forms, HTML transcripts, staff claiming, and full TOML configuration — no code changes needed.

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D18-green)
![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2)
![TypeScript](https://img.shields.io/badge/language-TypeScript-3178c6)

---

## Features

- **Multi-group** ticket system — run Support, Reports, Billing, etc. independently
- **Topic select → modal form** — up to 5 custom fields per topic, configured in TOML
- **Persistent counters** — `ticket-0001`, `ticket-0002`… per group, stored in `database.sqlite`
- **Archive + Reopen + Delete** — close without destroying; reopen any time; send transcript on permanent delete
- **HTML transcripts** — full chat export via [discord-html-transcripts](https://github.com/ItzDerock/discord-html-transcripts), posted to a dedicated channel
- **Staff claiming** — silent admin ping, logs to separate log channel
- **User rating** — 1–5 star rating collected before archive
- **Separate log / transcript channels** — global + per-group overrides
- **i18n** — built-in Russian and English; add more by creating `src/i18n/<lang>.ts`
- **Components V2** — all UI uses Discord's new component system
- **Zero-admin-required bot** — specific permissions only (no Administrator)

---

## Requirements

| Dependency | Version |
|---|---|
| Node.js | ≥ 18 |
| discord.js | 14 |
| TypeScript | 5 |

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/wexelsdev/HellTickets.git
cd HellTickets

# 2. Install dependencies
npm install

# 3. Configure (see Configuration below)
cp .env.example .env
# Fill in BOT_TOKEN in .env
# Fill in configs/global.toml and configs/groups/*.toml

# 4. Run (development)
npm run dev

# 5. Build & run (production)
npm run build
npm start
```

---

## Configuration

### `.env`

```env
BOT_TOKEN=your_bot_token_here
```

### `configs/global.toml`

```toml
guildId              = "YOUR_GUILD_ID"
language             = "en"              # "ru" | "en"

transcriptChannelId  = "TRANSCRIPT_CHANNEL_ID"   # HTML transcripts
logChannelId         = "LOG_CHANNEL_ID"           # claim / close events

adminRoleIds         = ["ROLE_ID_1", "ROLE_ID_2"]
```

### `configs/groups/<name>.toml`

One file per ticket group. Copy and adapt the example below:

```toml
name         = "support"
displayName  = "🔧 Technical Support"

initChannelId = "CHANNEL_ID"   # Channel where the "Create ticket" button appears
categoryId    = "CATEGORY_ID"  # Category where ticket channels are created
staffRoleId   = "ROLE_ID"      # Role that can see and manage these tickets

buttonLabel   = "Open a ticket"
buttonEmoji   = "📩"

welcomeMessage = "👋 Welcome! Describe your issue and a staff member will assist you shortly."

# Optional per-group overrides
transcriptChannelId = "CHANNEL_ID"
logChannelId        = "CHANNEL_ID"

# ── Topics ────────────────────────────────────────────────────────────────
[[selectMenuOptions]]
label       = "Technical Issue"
value       = "tech"
description = "Bugs, errors, crashes"
emoji       = "⚙️"

[[selectMenuOptions.fields]]
customId    = "problem"
label       = "Describe the issue"
style       = "paragraph"   # "short" | "paragraph"
placeholder = "Describe what happened in detail..."
required    = true

[[selectMenuOptions.fields]]
customId    = "steps"
label       = "Steps to reproduce"
style       = "paragraph"
required    = false

[[selectMenuOptions]]
label = "Other"
value = "other"
emoji = "❓"

[[selectMenuOptions.fields]]
customId = "message"
label    = "Your question"
style    = "paragraph"
required = true
```

> **Tip:** Discord modals support a maximum of **5 fields** per topic (`[[selectMenuOptions.fields]]`).

---

## Bot Permissions

HellTickets does **not** require Administrator. Invite the bot with these specific permissions:

| Permission | Why |
|---|---|
| `Manage Channels` | Create and rename ticket channels |
| `Manage Roles` | Set per-channel permission overrides |
| `View Channels` | Read channels and categories |
| `Send Messages` | Post ticket UI and log messages |
| `Read Message History` | Generate transcripts |
| `Attach Files` | Upload HTML transcript files |
| `Manage Messages` | Delete old init messages on restart |

**Invite URL scope:** `bot` + `applications.commands`

---

## Ticket Lifecycle

```
User clicks "Open a ticket" button
    → Selects topic from dropdown (ephemeral)
    → Fills in modal form
    → ticket-0001 channel created (user + staff can see)
        → Staff clicks "Claim" → silent admin ping, logged
        → Staff/user clicks "Close"
            → Confirmation popup
            → User rates support (1–5 ⭐)
            → Channel locked (user loses access), renamed closed-ticket-0001
            → Reopen / Delete buttons for staff
                → Reopen: restores user access, pings user
                → Delete: generates HTML transcript → posts to transcript channel → deletes channel
```

---

## Data Storage

| File | Contents |
|---|---|
| `database.sqlite` | Auto-generated SQLite database; stores ticket counters |
| `configs/global.toml` | Global IDs and settings |
| `configs/groups/*.toml` | Per-group configuration |

`database.sqlite` is git-ignored. Delete it to reset all ticket counters.

---

## Adding a Language

1. Copy `src/i18n/ru.ts` → `src/i18n/<lang>.ts`
2. Translate all string values
3. Import and register it in `src/i18n/index.ts`
4. Set `language = "<lang>"` in `configs/global.toml`

---

## Project Structure

```
HellTickets/
├── configs/
│   ├── global.toml          # Global bot config
│   └── groups/
│       ├── support.toml     # Ticket group: Support
│       └── report.toml      # Ticket group: Reports
├── src/
│   ├── index.ts             # Entry point
│   ├── config.ts            # Config loader
│   ├── types.ts             # TypeScript interfaces
│   ├── ticketStore.ts       # In-memory open-ticket store
│   ├── counter.ts           # Persistent ticket counters (bot.data)
│   ├── i18n/                # Translations
│   │   ├── types.ts         # Lang interface
│   │   ├── ru.ts
│   │   └── en.ts
│   ├── handlers/
│   │   └── interactionHandler.ts
│   └── modules/
│       ├── init.ts          # Init message per group
│       ├── ticketCreate.ts  # Create flow (button → topic → modal → channel)
│       ├── ticketClaim.ts   # Staff claim
│       ├── ticketClose.ts   # Close / archive / reopen / delete
│       ├── rating.ts        # Star rating collector
│       └── transcript.ts    # HTML transcript generator
├── .env.example
├── database.sqlite          # Auto-generated (git-ignored)
├── package.json
└── tsconfig.json
```

---

## License

MIT © 2026 [Ivan "wexels.dev" Timersky](https://wexels.dev)
