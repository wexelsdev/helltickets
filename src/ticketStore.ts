// ─────────────────────────────────────────────
//  Project: HellTickets
//  File: ticketStore.ts
//  Description: In-memory singleton store for all currently open tickets, keyed by channel ID
//  * Author: Ivan "wexels.dev" Timersky <mail@wexels.dev>
//  Created: 2026-03-01
//  * Copyright (c) 2026 wexels.dev. All rights reserved.
//  Licensed under the MIT License. See LICENSE file in the project root.
// ─────────────────────────────────────────────

import { TicketData } from './types';

class TicketStore {
    private store = new Map<string, TicketData>(); // key = channelId

    set(channelId: string, data: TicketData): void {
        this.store.set(channelId, data);
    }

    get(channelId: string): TicketData | undefined {
        return this.store.get(channelId);
    }

    delete(channelId: string): void {
        this.store.delete(channelId);
    }

    has(channelId: string): boolean {
        return this.store.has(channelId);
    }

    /** Mark the ticket as having at least one user message */
    markUserMessage(channelId: string): void {
        const data = this.store.get(channelId);
        if (data) {
            data.hasUserMessages = true;
        }
    }

    /** Set who claimed the ticket */
    setClaimed(channelId: string, userId: string, roleId: string): void {
        const data = this.store.get(channelId);
        if (data) { data.claimedBy = userId; data.claimedRole = roleId; }
    }

    /** Mark ticket as archived (awaiting permanent deletion) */
    setClosed(channelId: string, closedById: string, rating: number | null): void {
        const data = this.store.get(channelId);
        if (data) {
            data.isClosed = true;
            data.closedAt = new Date();
            data.closedById = closedById;
            data.rating = rating;
        }
    }

    /** True only if the ticket exists AND is NOT in the archived/closed state */
    isOpen(channelId: string): boolean {
        const d = this.store.get(channelId);
        return !!d && !d.isClosed;
    }

    /** Returns all open (non-archived) tickets */
    getOpenEntries(): [string, TicketData][] {
        return [...this.store.entries()].filter(([, d]) => !d.isClosed);
    }

    /** Reconstruct basic ticket state from channel metadata after a restart */
    hydrateFromChannel(channel: import('discord.js').TextChannel): void {
        if (this.store.has(channel.id)) return;

        const topic = channel.topic || '';
        const match = topic.match(/id=([^|]+)\|grp=([^|]+)/);
        if (!match) return; // Not a ticket channel

        const authorId = match[1];
        const groupName = match[2];
        const isClosed = channel.name.startsWith('closed-');

        this.store.set(channel.id, {
            channelId: channel.id,
            authorId,
            groupName,
            openedAt: channel.createdAt,
            hasUserMessages: true, // Safety default so we can prompt for rating / transcripts
            isClosed,
            rating: null, // Rating and claimed state are lost across restarts
            closedById: undefined,
        });
    }
}

// Singleton export
export const ticketStore = new TicketStore();
