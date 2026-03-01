# Contributing to HellTickets

Thank you for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/wexelsdev/HellTickets.git
cd HellTickets
npm install
cp .env.example .env
# Add your BOT_TOKEN and set up configs/global.toml
npm run dev
```

## Project Conventions

- **Language:** TypeScript — all source files in `src/`
- **Style:** 4-space indent, single quotes
- **File headers:** every `.ts` file must have the standard MIT header block
- **i18n:** all user-facing strings must go through `src/i18n/` — no hardcoded text in modules
- **Config:** new global settings → `configs/global.toml` + `GlobalConfig` in `types.ts`; new per-group settings → group TOML + `TicketGroup` in `types.ts`
- **Persistent data:** use `readDataFile()`/`writeDataFile()` from `counter.ts` to add new sections to `bot.data`

## Adding a Feature

1. Fork the repo and create a branch: `git checkout -b feature/my-feature`
2. Make your changes with the conventions above
3. Run `npx tsc --noEmit` — must produce zero errors
4. Open a pull request with a clear description of what changed and why

## Adding a Language

1. Copy `src/i18n/en.ts` → `src/i18n/<code>.ts`
2. Translate all values (keep function signatures identical)
3. Register it in `src/i18n/index.ts`
4. Open a pull request titled `i18n: add <language name>`

## Reporting Bugs

Open an issue and include:
- Node.js version (`node -v`)
- discord.js version
- The full error output from the bot console
- Steps to reproduce

## Code of Conduct

Be respectful. Constructive feedback only.
