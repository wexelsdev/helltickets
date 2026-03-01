# Terms of Service

**Last updated:** 2026-03-01  
**Effective from:** 2026-03-01

## 1. Acceptance

By adding HellTickets to your Discord server or interacting with it, you agree to these Terms of Service. If you do not agree, remove the bot from your server and stop using it.

## 2. Description of Service

HellTickets is an open-source Discord bot that provides a ticket management system. It allows users to create support tickets, which are handled by designated staff members within your Discord server.

## 3. Use of the Bot

You agree to use HellTickets only in compliance with:
- [Discord's Terms of Service](https://discord.com/terms)
- [Discord's Community Guidelines](https://discord.com/guidelines)
- All applicable local laws and regulations

You may **not** use HellTickets to:
- Harass, threaten, or harm other users
- Distribute illegal or harmful content
- Attempt to exploit, abuse, or overload the bot

## 4. Data Collection

HellTickets processes the following data solely to operate its core features:

| Data | Purpose | Retention |
|---|---|---|
| Discord user IDs | Identify ticket authors, staff | In-memory only; cleared on restart |
| Discord role IDs | Permission checks | Config files only |
| Discord channel IDs | Route tickets and logs | Config files only |
| Message content | Generate HTML transcripts | Posted to your transcript channel; not stored by the bot |
| Ticket counter values | Persistent numbering | `database.sqlite` file on the host server |

No data is transmitted to external servers other than Discord's own API.

## 5. Self-Hosted Bot

HellTickets is a **self-hosted** bot. The server administrator who hosts the bot is solely responsible for:
- Keeping the bot secure and up to date
- Ensuring compliant use within their server
- Managing any data stored in the bot's `database.sqlite` file

The developer (Ivan "wexels.dev" Timersky) is not responsible for any misuse by server administrators or users.

## 6. Disclaimer of Warranties

HellTickets is provided **"as is"**, without warranty of any kind. The developer makes no guarantees regarding uptime, accuracy, or fitness for a particular purpose.

## 7. Limitation of Liability

To the fullest extent permitted by law, the developer shall not be liable for any indirect, incidental, or consequential damages arising from use of HellTickets.

## 8. Changes to These Terms

Terms may be updated at any time. Continued use of the bot after an update constitutes acceptance of the revised terms.

## 9. Contact

Questions? Open an issue on [GitHub](https://github.com/wexelsdev/HellTickets) or contact [mail@wexels.dev](mailto:mail@wexels.dev).
