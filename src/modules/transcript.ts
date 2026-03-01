// ─────────────────────────────────────────────
//  Project: HellTickets
//  File: modules/transcript.ts
//  Description: Generates HTML transcript and posts it; sends a brief event log to the log channel.
//               Called exclusively from deleteTicket — never from confirmClose.
//  * Author: Ivan "wexels.dev" Timersky <mail@wexels.dev>
//  Created: 2026-03-01
//  * Copyright (c) 2026 wexels.dev. All rights reserved.
//  Licensed under the MIT License. See LICENSE file in the project root.
// ─────────────────────────────────────────────

import {
    Client,
    ContainerBuilder,
    Guild,
    SeparatorBuilder,
    TextChannel,
    TextDisplayBuilder,
} from 'discord.js';
import { createTranscript } from 'discord-html-transcripts';
import { globalConfig, ticketGroups } from '../config';
import { TicketData } from '../types';
import { t } from '../i18n';

const CV2 = 32768;
const STARS: Record<number, string> = { 1: '⭐', 2: '⭐⭐', 3: '⭐⭐⭐', 4: '⭐⭐⭐⭐', 5: '⭐⭐⭐⭐⭐' };

// Silent pings: renders <@id> / <@&id> visually but sends no notification
const SILENT = { allowedMentions: { users: [] as string[], roles: [] as string[] } };

export async function sendTranscript(
    client: Client, guild: Guild,
    ticketChannel: TextChannel, ticketData: TicketData,
    closedById: string, rating: number | null,
): Promise<void> {
    try {
        const group = ticketGroups.find((g) => g.name === ticketData.groupName);
        const transcriptChannelId = group?.transcriptChannelId ?? globalConfig.transcriptChannelId;
        const transcriptChannel = await client.channels.fetch(transcriptChannelId).catch(() => null);

        if (!transcriptChannel?.isTextBased()) {
            console.warn('[transcript] Transcript channel not found or not text-based.');
            return;
        }

        // Generate HTML transcript file
        const attachment = await createTranscript(ticketChannel, {
            limit: -1,
            filename: `transcript-${ticketChannel.name}.html`,
            saveImages: false,
            poweredBy: false,
        });

        const dur = formatDuration(Date.now() - ticketData.openedAt.getTime());
        const ratingStr = rating ? STARS[rating] : t.no_rating;
        const groupLabel = group?.displayName ?? ticketData.groupName;
        // Strip closed- prefix so transcript always shows the original ticket name
        const cleanName = ticketChannel.name.replace(/^closed-/, '');

        // IDs for silent pings
        const adminId = ticketData.claimedBy ?? null;
        const adminRoleId = ticketData.claimedRole ?? null;

        // ── Transcript channel: summary (CV2) + HTML file (separate plain message) ──
        const transcriptContainer = new ContainerBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    t.transcript_line(
                        cleanName, groupLabel,
                        ticketData.authorId, closedById,
                        adminId, adminRoleId,
                        dur, ratingStr,
                    ),
                ),
            )
            .addSeparatorComponents(new SeparatorBuilder().setDivider(false))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(t.transcript_footer));

        // 1. Components V2 summary (no files — CV2 restriction)
        await (transcriptChannel as TextChannel).send({
            components: [transcriptContainer],
            flags: CV2 as any,
            ...SILENT,
        });

        // 2. HTML transcript file as a plain message (no CV2 flag required for file-only)
        await (transcriptChannel as TextChannel).send({ files: [attachment] });

        // ── Log channel ───────────────────────────────────────────────────────
        const logChannelId = group?.logChannelId ?? globalConfig.logChannelId;
        if (logChannelId && logChannelId !== transcriptChannelId) {
            const logChannel = await client.channels.fetch(logChannelId).catch(() => null);
            if (logChannel?.isTextBased()) {
                await (logChannel as TextChannel).send({
                    components: [
                        new ContainerBuilder().addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(
                                t.log_closed(cleanName, ticketData.authorId, dur, ratingStr, groupLabel),
                            ),
                        ),
                    ],
                    flags: CV2 as any,
                    ...SILENT,
                });
            }
        }

        console.log(`[transcript] Transcript for ${ticketChannel.name} sent.`);
    } catch (err) {
        console.error('[transcript] Failed to send transcript:', err);
    }
}

function formatDuration(ms: number): string {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const parts: string[] = [];
    if (h) parts.push(`${h}ч`);
    if (m) parts.push(`${m}м`);
    parts.push(`${s % 60}с`);
    return parts.join(' ');
}
