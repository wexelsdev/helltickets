// ─────────────────────────────────────────────
//  Project: HellTickets
//  File: index.ts
//  Description: Bot entry point — initialises the Discord client, attaches event listeners and logs in
//  * Author: Ivan "wexels.dev" Timersky <mail@wexels.dev>
//  Created: 2026-03-01
//  * Copyright (c) 2026 wexels.dev. All rights reserved.
//  Licensed under the MIT License. See LICENSE file in the project root.
// ─────────────────────────────────────────────

import 'dotenv/config';
import {
    Client,
    GatewayIntentBits,
    Guild,
    Partials,
} from 'discord.js';
import { handleInteraction, handleMessageCreate } from './handlers/interactionHandler';
import { sendInitMessages } from './modules/init';
import { globalConfig, ticketGroups } from './config';
import { ticketStore } from './ticketStore';

// ── Client setup ────────────────────────────────────────────────────────
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Channel],
});

// ── Ready ────────────────────────────────────────────────────────────────
client.once('clientReady', async () => {
    console.log(`Logged in as ${client.user!.tag}`);

    const guild = await client.guilds.fetch(globalConfig.guildId).catch(() => null) as Guild | null;

    if (!guild) {
        console.error(`Guild ${globalConfig.guildId} not found. Check guildId in configs/global.toml`);
        return;
    }

    // Ensure member cache is populated (needed for permission resolving)
    await guild.members.fetch().catch(() => null);

    // Hydrate existing tickets from categories so buttons work after bot restart
    const validCategoryIds = new Set(ticketGroups.map(g => g.categoryId));
    const channels = await guild.channels.fetch().catch(() => null);
    if (channels) {
        for (const channel of channels.values()) {
            if (channel?.isTextBased() && channel.parentId && validCategoryIds.has(channel.parentId)) {
                ticketStore.hydrateFromChannel(channel as import('discord.js').TextChannel);
            }
        }
    }
    console.log(`[ticketStore] Hydrated ${ticketStore.getOpenEntries().length} open tickets.`);

    console.log(`Connected to guild: ${guild.name}`);
    await sendInitMessages(client, guild);
});

// ── interactionCreate ────────────────────────────────────────────────────
client.on('interactionCreate', async (interaction) => {
    const guild = interaction.guild ?? await client.guilds.fetch(globalConfig.guildId).catch(() => null) as Guild | null;

    if (!guild) {
        console.warn('[index] Could not resolve guild for interaction');
        return;
    }

    try {
        await handleInteraction(interaction, client, guild);
    } catch (err) {
        console.error('[index] Unhandled interaction error:', err);
    }
});

// ── messageCreate ────────────────────────────────────────────────────────
client.on('messageCreate', (message) => {
    handleMessageCreate(message);
});

// ── Login ─────────────────────────────────────────────────────────────────
const token = process.env.BOT_TOKEN;
if (!token) {
    console.error('BOT_TOKEN is not set in .env');
    process.exit(1);
}

client.login(token).catch((err) => {
    console.error('Failed to login:', err);
    process.exit(1);
});
