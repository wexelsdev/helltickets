// ─────────────────────────────────────────────
//  Project: HellTickets
//  File: modules/init.ts
//  Description: Sends or updates the ticket-creation init message in each group's channel
//  * Author: Ivan "wexels.dev" Timersky <mail@wexels.dev>
//  Created: 2026-03-01
//  * Copyright (c) 2026 wexels.dev. All rights reserved.
//  Licensed under the MIT License. See LICENSE file in the project root.
// ─────────────────────────────────────────────

import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Client,
    ContainerBuilder,
    Guild,
    SeparatorBuilder,
    TextChannel,
    TextDisplayBuilder,
} from 'discord.js';
import { ticketGroups } from '../config';
import { t } from '../i18n';

const CV2 = 32768;

export async function sendInitMessages(client: Client, guild: Guild): Promise<void> {
    for (const group of ticketGroups) {
        try {
            const channel = await client.channels.fetch(group.initChannelId).catch(() => null);
            if (!channel || !channel.isTextBased()) {
                console.warn(`[init] Channel ${group.initChannelId} not found (group: ${group.name})`);
                continue;
            }

            const textChannel = channel as TextChannel;

            const container = new ContainerBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`**${group.displayName}**`),
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(t.init_subtitle),
                )
                .addSeparatorComponents(new SeparatorBuilder())
                .addActionRowComponents(
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`create_ticket_${group.name}`)
                            .setLabel(group.buttonLabel)
                            .setEmoji(group.buttonEmoji)
                            .setStyle(ButtonStyle.Secondary),
                    ),
                );

            const payload = { components: [container], flags: CV2 as any };

            // Delete old bot messages, then send fresh
            const messages = await textChannel.messages.fetch({ limit: 20 });
            for (const [, msg] of messages.filter((m) => m.author.id === client.user!.id)) {
                await msg.delete().catch(() => null);
            }

            await textChannel.send(payload);
            console.log(`[init] Sent init message for group "${group.name}"`);
        } catch (err) {
            console.error(`[init] Error processing group "${group.name}":`, err);
        }
    }
}
