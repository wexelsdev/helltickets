// ─────────────────────────────────────────────
//  Project: HellTickets
//  File: i18n/en.ts
//  Description: English translations
//  * Author: Ivan "wexels.dev" Timersky <mail@wexels.dev>
//  Created: 2026-03-01
//  * Copyright (c) 2026 wexels.dev. All rights reserved.
//  Licensed under the MIT License. See LICENSE file in the project root.
// ─────────────────────────────────────────────

import { Lang } from './types';

export const en: Lang = {
    // — Errors
    err_channel_not_ticket: '❌ This channel is not an active ticket.',
    err_member_not_found: '❌ Could not fetch member data.',
    err_group_not_found: '❌ Ticket group not found.',
    err_no_permission: '❌ You do not have permission for this action.',
    err_no_author: '❌ Could not determine the ticket author.',
    err_ticket_create_failed: '❌ Failed to create ticket. Please try again later.',
    err_ticket_not_found: '❌ Ticket not found.',

    // — Init
    init_subtitle: '-# Click the button below to open a ticket. A staff member will reply shortly.',

    // — Create flow
    already_has_ticket: (id) => `❌ You already have an open ticket: <#${id}>`,
    topic_prompt: (g) => `**${g}** — select a topic:`,
    topic_placeholder: '💬 Select a topic...',
    ticket_created: (id) => `Ticket created: <#${id}>`,

    // — Ticket interface
    ticket_heading: (topic, group, authorId) =>
        `<@${authorId}> · **${topic}**\n-# ${group}`,
    btn_close: 'Close',
    btn_claim: 'Claim ticket',

    // — Close flow
    close_confirm: 'Close this ticket?',
    btn_confirm: 'Confirm',
    btn_cancel: 'Cancel',
    cancelled: 'Cancelled.',
    closing: '🔒 Closing...',
    closed_msg: (authorId, closerTag) =>
        `🔒 Ticket closed · <@${authorId}>\n-# Closed by: ${closerTag}`,
    btn_reopen: 'Reopen',
    btn_delete: 'Delete',
    deleting: '🗑️ Deleting...',
    delete_no_perm: '❌ You do not have permission to delete this ticket.',
    reopen_msg: (authorId, closerTag) =>
        `🔓 <@${authorId}> Ticket reopened · ${closerTag}`,
    already_claimed: (id) => `⚠️ Ticket already claimed by <@${id}>.`,

    // — Claim
    claim_no_perm: '❌ You do not have permission to claim tickets in this group.',
    claimed_msg: (adminId, roleId) =>
        `🛡️ <@${adminId}> _(<@&${roleId}>)_ claimed the ticket.`,
    claim_log: (channelId, adminId, roleId, group) =>
        `🛡️ **Ticket claimed** · <#${channelId}>\n<@${adminId}> <@&${roleId}>\n-# ${group}`,

    // — Rating
    rating_prompt: 'Rate the quality of support (1 — poor, 5 — excellent):',
    rating_placeholder: 'Rate the support quality...',
    rating_thanks: (s) => `Thank you! ${s}`,
    rating_done: (s) => `Rating: ${s}`,
    rating_labels: ['Very poor', 'Poor', 'Okay', 'Good', 'Excellent!'],

    // — Transcript (all IDs → silent pings in caller with allowedMentions)
    transcript_line: (ch, grp, authorId, closerId, adminId, adminRoleId, dur, rating) =>
        [
            `📋 **${ch}** · ${grp}`,
            `👤 Opened by: <@${authorId}>`,
            `🔒 Closed by: <@${closerId}>`,
            `🛡️ Claimed by: ${adminId ? `<@${adminId}>${adminRoleId ? ` <@&${adminRoleId}>` : ''}` : '—'}`,
            `⏱️ ${dur}  ·  📊 ${rating}`,
        ].join('\n'),
    transcript_footer: '-# Transcript attached',
    log_closed: (ch, authorId, dur, rating, grp) =>
        `🔒 **${ch}** · <@${authorId}>\n-# ${dur} · ${rating} · ${grp}`,
    no_rating: '—',
};
