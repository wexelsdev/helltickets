# Privacy Policy

**Last updated:** 2026-03-01  
**Effective from:** 2026-03-01

## 1. Overview

This Privacy Policy explains what data HellTickets collects, how it is used, and your rights regarding that data.

HellTickets is a **self-hosted** open-source Discord bot. This policy applies to the official build distributed by Ivan "wexels.dev" Timersky. Server administrators who self-host alter their own instance's data handling and are independently responsible for compliance.

## 2. Data We Process

HellTickets processes the minimum data necessary to function:

### 2.1 Processed at Runtime (not persisted by the bot)

| Data | Reason |
|---|---|
| Discord user ID | Identify ticket author, check permissions |
| Discord username / tag | Displayed in ticket interface and transcripts |
| Discord role IDs | Verify staff / admin permissions |
| Discord channel IDs | Create and manage ticket channels |
| Message content | Generate HTML transcript at close |

All runtime data is held **in memory only** and cleared on bot restart.

### 2.2 Persisted on the Host Server

| Data | Location | Reason |
|---|---|---|
| Per-group ticket counters | `database.sqlite` | Persistent ticket numbering (`ticket-0001`) |

No other data is written to disk by the bot.

### 2.3 Posted to Your Discord Server

| Data | Destination |
|---|---|
| HTML transcript (full message history) | Your designated transcript channel |
| Ticket log events (claim, close) | Your designated log channel |
| User rating (1–5 stars) | Included in log message |

This data remains within your Discord server and is governed by [Discord's Privacy Policy](https://discord.com/privacy).

## 3. Data Sharing

HellTickets does **not**:
- Send any data to third-party services
- Store data on external databases or cloud services
- Use data for advertising or analytics

The only external communication is with the Discord API, which is required for the bot to operate.

## 4. Data Retention

- **In-memory data** — cleared on every bot restart
- **`database.sqlite`** — retained until manually deleted by the server administrator
- **HTML transcripts and logs** — controlled by the server's Discord channel retention settings

## 5. Your Rights

As this is a self-hosted bot, requests regarding your data should be directed to the administrator of the Discord server you interacted with.

If you have concerns about the open-source code itself, open an issue on [GitHub](https://github.com/wexelsdev/HellTickets).

## 6. Children's Privacy

HellTickets does not knowingly interact with users under 13 (or the applicable age of digital consent in their jurisdiction). Use of Discord already requires compliance with Discord's own age requirements.

## 7. Changes to This Policy

This policy may be updated. The "Last updated" date at the top will reflect any changes.

## 8. Contact

[mail@wexels.dev](mailto:mail@wexels.dev) — or open an issue on GitHub.
