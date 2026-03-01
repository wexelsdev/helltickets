// ─────────────────────────────────────────────
//  Project: HellTickets
//  File: modules/ticketClose.ts
//  Description: Close confirmation, archive (rate + lock), reopen, permanent delete (+ transcript)
//  * Author: Ivan "wexels.dev" Timersky <mail@wexels.dev>
//  Created: 2026-03-01
//  * Copyright (c) 2026 wexels.dev. All rights reserved.
//  Licensed under the MIT License. See LICENSE file in the project root.
// ─────────────────────────────────────────────

import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    Client,
    ContainerBuilder,
    Guild,
    SeparatorBuilder,
    TextChannel,
    TextDisplayBuilder,
} from 'discord.js';
import { ticketStore } from '../ticketStore';
import { globalConfig, ticketGroups } from '../config';
import { askForRating } from './rating';
import { sendTranscript } from './transcript';
import { t } from '../i18n';

const CV2 = 32768;
const EPH_V2 = (64 | 32768) as any;

// ── Step 1: Show confirmation ────────────────────────────────────────────

export async function closeTicket(interaction: ButtonInteraction): Promise<void> {
    if (!ticketStore.isOpen(interaction.channelId)) {
        await interaction.reply({ components: [txt(t.err_channel_not_ticket)], flags: EPH_V2 });
        return;
    }

    const container = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(t.close_confirm))
        .addSeparatorComponents(new SeparatorBuilder().setDivider(false))
        .addActionRowComponents(
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setCustomId('confirm_close').setLabel(t.btn_confirm).setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('cancel_close').setLabel(t.btn_cancel).setStyle(ButtonStyle.Secondary),
            ),
        );

    await interaction.reply({ components: [container], flags: EPH_V2 });
}

// ── Step 2: Cancel ────────────────────────────────────────────────────────

export async function cancelClose(interaction: ButtonInteraction): Promise<void> {
    await interaction.update({ components: [txt(t.cancelled)], flags: EPH_V2 as any });
}

// ── Step 3: Confirm → archive (rate → lock → keep for reopen/delete) ─────

export async function confirmClose(
    interaction: ButtonInteraction, _client: Client, _guild: Guild,
): Promise<void> {
    const channelId = interaction.channelId;
    const ticketData = ticketStore.get(channelId);

    if (!ticketData || ticketData.isClosed) {
        await interaction.update({ components: [txt(t.err_ticket_not_found)], flags: EPH_V2 as any });
        return;
    }

    await interaction.update({ components: [txt(t.closing)], flags: EPH_V2 as any });

    const channel = interaction.channel as TextChannel;

    try {
        // Ask for rating BEFORE removing user access
        let rating: number | null = null;
        if (ticketData.hasUserMessages) {
            rating = await askForRating(channel, ticketData.authorId);
        }

        // Mark as archived in store (keeps data alive for deleteTicket to use)
        ticketStore.setClosed(channelId, interaction.user.id, rating);

        // Remove user access
        await channel.permissionOverwrites.edit(ticketData.authorId, {
            ViewChannel: false, SendMessages: false,
        });

        // Rename → closed-*
        if (!channel.name.startsWith('closed-')) {
            await channel.setName(`closed-${channel.name}`).catch(() => null);
        }

        // Show archive message: Reopen + Delete buttons for staff
        const archiveContainer = new ContainerBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(t.closed_msg(ticketData.authorId, interaction.user.tag)),
            )
            .addSeparatorComponents(new SeparatorBuilder().setDivider(false))
            .addActionRowComponents(
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder().setCustomId('reopen_ticket').setLabel(t.btn_reopen).setEmoji('🔓').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('delete_ticket').setLabel(t.btn_delete).setEmoji('🗑️').setStyle(ButtonStyle.Secondary),
                ),
            );

        await channel.send({
            components: [archiveContainer],
            flags: CV2 as any,
            allowedMentions: { users: [] },  // closed_msg includes <@authorId> — silent
        });
    } catch (err) {
        console.error('[ticketClose] Archive error:', err);
    }
}

// ── Reopen ────────────────────────────────────────────────────────────────

export async function reopenTicket(interaction: ButtonInteraction, guild: Guild): Promise<void> {
    const channel = interaction.channel as TextChannel;
    const topic = channel.topic ?? '';
    const authorId = parseTopic(topic, 'id');
    const groupName = parseTopic(topic, 'grp');

    if (!authorId) {
        await interaction.reply({ components: [txt(t.err_no_author)], flags: EPH_V2 });
        return;
    }

    // Restore user permissions
    await channel.permissionOverwrites.edit(authorId, {
        ViewChannel: true, SendMessages: true, ReadMessageHistory: true, AttachFiles: true,
    });

    if (channel.name.startsWith('closed-')) {
        await channel.setName(channel.name.replace(/^closed-/, '')).catch(() => null);
    }

    // Restore as open in the store
    ticketStore.set(channel.id, {
        authorId, groupName: groupName ?? 'unknown', channelId: channel.id,
        openedAt: new Date(), hasUserMessages: true,
        claimedBy: undefined, claimedRole: undefined,
    });

    await interaction.reply({
        components: [txt(t.reopen_msg(authorId, interaction.user.tag))],
        flags: CV2 as any,
        allowedMentions: { users: [authorId] }, // actual ping on reopen
    });
}

// ── Delete (permanent) — generates transcript FIRST ──────────────────────

export async function deleteTicket(
    interaction: ButtonInteraction, guild: Guild,
): Promise<void> {
    const channel = interaction.channel as TextChannel;
    const topic = channel.topic ?? '';
    const groupName = parseTopic(topic, 'grp');
    const group = ticketGroups.find((g) => g.name === groupName);

    // Permission check
    const relevantRoleIds = new Set<string>();
    if (group) relevantRoleIds.add(group.staffRoleId);
    for (const id of globalConfig.adminRoleIds) relevantRoleIds.add(id);

    const member = await guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member?.roles.cache.some((r) => relevantRoleIds.has(r.id))) {
        await interaction.reply({ components: [txt(t.delete_no_perm)], flags: EPH_V2 });
        return;
    }

    await interaction.reply({ components: [txt(t.deleting)], flags: EPH_V2 });

    // Get stored ticket data (may be archived)
    const ticketData = ticketStore.get(channel.id);

    if (ticketData) {
        // Generate and send transcript NOW (with the collected rating)
        const closedById = ticketData.closedById ?? interaction.user.id;
        const rating = ticketData.rating ?? null;
        await sendTranscript(interaction.client, guild, channel, ticketData, closedById, rating);
        ticketStore.delete(channel.id);
    }

    await delay(1500);
    await channel.delete('Ticket permanently deleted by staff').catch(() => null);
}

// ── Helpers ────────────────────────────────────────────────────────────────

function parseTopic(topic: string, key: string): string | undefined {
    return topic.match(new RegExp(`${key}=([^|]+)`))?.[1];
}

function txt(content: string): ContainerBuilder {
    return new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(content));
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
