// ─────────────────────────────────────────────
//  Project: HellTickets
//  File: i18n/types.ts
//  Description: Translation contract — all user-facing strings for the bot
//  * Author: Ivan "wexels.dev" Timersky <mail@wexels.dev>
//  Created: 2026-03-01
//  * Copyright (c) 2026 wexels.dev. All rights reserved.
//  Licensed under the MIT License. See LICENSE file in the project root.
// ─────────────────────────────────────────────

export interface Lang {
    // — Errors
    err_channel_not_ticket: string;
    err_member_not_found: string;
    err_group_not_found: string;
    err_no_permission: string;
    err_no_author: string;
    err_ticket_create_failed: string;
    err_ticket_not_found: string;

    // — Init
    init_subtitle: string;

    // — Ticket create flow
    already_has_ticket: (channelId: string) => string;
    topic_prompt: (groupName: string) => string;
    topic_placeholder: string;
    ticket_created: (channelId: string) => string;

    // — Ticket interface
    ticket_heading: (topicLabel: string, displayName: string, authorId: string) => string;
    btn_close: string;
    btn_claim: string;

    // — Close flow
    close_confirm: string;
    btn_confirm: string;
    btn_cancel: string;
    cancelled: string;
    closing: string;
    closed_msg: (authorId: string, closerTag: string) => string;
    btn_reopen: string;
    btn_delete: string;
    deleting: string;
    delete_no_perm: string;
    reopen_msg: (authorId: string, closerTag: string) => string;
    already_claimed: (adminId: string) => string;

    // — Claim
    claim_no_perm: string;
    claimed_msg: (adminId: string, roleId: string) => string;
    claim_log: (channelId: string, adminId: string, roleId: string, group: string) => string;

    // — Rating
    rating_prompt: string;
    rating_placeholder: string;
    rating_thanks: (stars: string) => string;
    rating_done: (stars: string) => string;
    rating_labels: [string, string, string, string, string];

    // — Transcript
    transcript_line: (
        channelName: string, group: string,
        authorId: string, closerId: string,
        adminId: string | null, adminRoleId: string | null,
        dur: string, rating: string
    ) => string;
    transcript_footer: string;
    log_closed: (channelName: string, authorId: string, dur: string, rating: string, group: string) => string;
    no_rating: string;
}
