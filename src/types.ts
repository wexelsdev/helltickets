// ─────────────────────────────────────────────
//  Project: HellTickets
//  File: types.ts
//  Description: TypeScript interfaces for all bot data structures and configuration
//  * Author: Ivan "wexels.dev" Timersky <mail@wexels.dev>
//  Created: 2026-03-01
//  * Copyright (c) 2026 wexels.dev. All rights reserved.
//  Licensed under the MIT License. See LICENSE file in the project root.
// ─────────────────────────────────────────────

export interface ModalField {
    /** Unique ID for the field (used to retrieve value from modal) */
    customId: string;
    /** Label shown above the input */
    label: string;
    /** 'short' = single line, 'paragraph' = multi-line */
    style: 'short' | 'paragraph';
    placeholder?: string;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
}

export interface SelectMenuOption {
    label: string;
    value: string;
    description?: string;
    emoji?: string;
    /** Modal form fields shown when this topic is selected */
    fields?: ModalField[];
}

/** One entry in the ticketGroups array */
export interface TicketGroup {
    /** Unique machine-readable key, e.g. "support" */
    name: string;
    /** Human-readable display name shown in embeds */
    displayName: string;
    /** ID of the channel where the init embed is posted */
    initChannelId: string;
    /** ID of the Discord category where ticket channels are created */
    categoryId: string;
    /** Role that can see and manage tickets in this group */
    staffRoleId: string;
    /** Text on the "Create ticket" button */
    buttonLabel: string;
    /** Emoji on the "Create ticket" button */
    buttonEmoji: string;
    /** Message the bot sends when a ticket is first opened */
    welcomeMessage: string;
    /** Options for the topic select menu inside the ticket */
    selectMenuOptions: SelectMenuOption[];
    /** Optional: separate transcript channel for this group */
    transcriptChannelId?: string;
    /** Optional: separate log channel for this group */
    logChannelId?: string;
}

/** Global configuration shared across all groups */
export interface GlobalConfig {
    /** Top-level admin roles that can see ALL tickets (unlimited) */
    adminRoleIds: string[];
    /** Channel for HTML transcripts (full conversation) */
    transcriptChannelId: string;
    /** Channel for event logs: opened / claimed / closed */
    logChannelId: string;
    /** Guild ID (also read from .env but stored here for convenience) */
    guildId: string;
    /** Bot language code — must match a file in src/i18n/ (e.g. "ru", "en") */
    language?: string;
}

/** In-memory record for an open or archived ticket */
export interface TicketData {
    authorId: string;
    groupName: string;
    channelId: string;
    openedAt: Date;
    claimedBy?: string;    // user ID of admin who claimed
    claimedRole?: string;  // role ID they used
    hasUserMessages: boolean;
    /** Set to true after confirmClose — pending permanent deletion */
    isClosed?: boolean;
    closedAt?: Date;
    closedById?: string;
    rating?: number | null;
}
