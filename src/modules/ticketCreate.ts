// ─────────────────────────────────────────────
//  Project: HellTickets
//  File: modules/ticketCreate.ts
//  Description: 3-step ticket creation flow: topic select → modal → channel creation
//  * Author: Ivan "wexels.dev" Timersky <mail@wexels.dev>
//  Created: 2026-03-01
//  * Copyright (c) 2026 wexels.dev. All rights reserved.
//  Licensed under the MIT License. See LICENSE file in the project root.
// ─────────────────────────────────────────────

import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CategoryChannel,
    ChannelType,
    ContainerBuilder,
    Guild,
    ModalBuilder,
    ModalSubmitInteraction,
    OverwriteType,
    PermissionFlagsBits,
    SeparatorBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    TextChannel,
    TextDisplayBuilder,
    TextInputBuilder,
    TextInputStyle,
    ButtonInteraction,
} from 'discord.js';
import { globalConfig, ticketGroups } from '../config';
import { TicketGroup } from '../types';
import { ticketStore } from '../ticketStore';
import { counterStore } from '../counter';
import { t } from '../i18n';

const CV2 = 32768;
const EPH_V2 = (64 | 32768) as any;

// ── STEP 1: Button → ephemeral topic select ──────────────────────────────

export async function createTicket(interaction: ButtonInteraction, guild: Guild): Promise<void> {
    const groupName = interaction.customId.replace('create_ticket_', '');
    const group = ticketGroups.find((g) => g.name === groupName);

    if (!group) {
        await interaction.reply({ components: [txt(t.err_group_not_found)], flags: EPH_V2 });
        return;
    }

    const store = (ticketStore as any)['store'] as Map<string, { authorId: string; groupName: string; isClosed?: boolean }>;
    const existing = [...store.entries()].find(
        ([, d]) => d.authorId === interaction.user.id && d.groupName === group.name && !d.isClosed,
    );
    if (existing) {
        await interaction.reply({ components: [txt(t.already_has_ticket(existing[0]))], flags: EPH_V2 });
        return;
    }

    const topicMenu = new StringSelectMenuBuilder()
        .setCustomId(`topic_preselect_${group.name}`)
        .setPlaceholder(t.topic_placeholder)
        .addOptions(group.selectMenuOptions.map((o) => ({
            label: o.label, value: o.value, description: o.description, emoji: o.emoji,
        })));

    const container = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(t.topic_prompt(group.displayName)))
        .addSeparatorComponents(new SeparatorBuilder().setDivider(false))
        .addActionRowComponents(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(topicMenu));

    await interaction.reply({ components: [container], flags: EPH_V2 });
}

// ── STEP 2: Topic selected → modal ──────────────────────────────────────

export async function handleTopicPreselect(interaction: StringSelectMenuInteraction): Promise<void> {
    const groupName = interaction.customId.replace('topic_preselect_', '');
    const group = ticketGroups.find((g) => g.name === groupName);
    const topicValue = interaction.values[0];
    const option = group?.selectMenuOptions.find((o) => o.value === topicValue);

    if (!group || !option) { await interaction.deferUpdate(); return; }

    const fields = option.fields ?? [];

    if (fields.length === 0) {
        await interaction.deferUpdate();
        await createTicketChannel(interaction.user.id, interaction.user.username, group, topicValue, option.label, {}, interaction.guild!);
        return;
    }

    const modal = new ModalBuilder()
        .setCustomId(`modal_ticket_${group.name}_${topicValue}`)
        .setTitle(`${option.emoji ?? ''} ${option.label}`.trim().slice(0, 45));

    modal.addComponents(fields.slice(0, 5).map((field) => {
        const input = new TextInputBuilder()
            .setCustomId(field.customId)
            .setLabel(field.label.slice(0, 45))
            .setStyle(field.style === 'paragraph' ? TextInputStyle.Paragraph : TextInputStyle.Short)
            .setRequired(field.required ?? true);
        if (field.placeholder) input.setPlaceholder(field.placeholder.slice(0, 100));
        if (field.minLength) input.setMinLength(field.minLength);
        if (field.maxLength) input.setMaxLength(field.maxLength);
        return new ActionRowBuilder<TextInputBuilder>().addComponents(input);
    }));

    await interaction.showModal(modal);
}

// ── STEP 3: Modal submit → create channel ────────────────────────────────

export async function handleModalSubmit(interaction: ModalSubmitInteraction, guild: Guild): Promise<void> {
    const withoutPrefix = interaction.customId.replace('modal_ticket_', '');
    const sepIdx = withoutPrefix.indexOf('_');
    const groupName = withoutPrefix.slice(0, sepIdx);
    const topicValue = withoutPrefix.slice(sepIdx + 1);

    const group = ticketGroups.find((g) => g.name === groupName);
    const option = group?.selectMenuOptions.find((o) => o.value === topicValue);

    if (!group || !option) {
        await interaction.reply({ components: [txt(t.err_group_not_found)], flags: EPH_V2 });
        return;
    }

    const answers: Record<string, string> = {};
    for (const field of option.fields ?? []) {
        try { answers[field.label] = interaction.fields.getTextInputValue(field.customId); }
        catch { /* optional */ }
    }

    await interaction.deferReply({ flags: 64 as any });

    try {
        const channelId = await createTicketChannel(
            interaction.user.id, interaction.user.username,
            group, topicValue, option.label, answers, guild,
        );
        await interaction.editReply({ components: [txt(t.ticket_created(channelId))], flags: CV2 as any });
    } catch (err) {
        console.error('[ticketCreate] Modal submit error:', err);
        await interaction.editReply(t.err_ticket_create_failed);
    }
}

// ── Core: create the ticket channel ──────────────────────────────────────

async function createTicketChannel(
    authorId: string, authorUsername: string,
    group: TicketGroup, topicValue: string, topicLabel: string,
    answers: Record<string, string>, guild: Guild,
): Promise<string> {
    const category = await guild.channels.fetch(group.categoryId).catch(() => null);
    if (!category || category.type !== ChannelType.GuildCategory) throw new Error('Category not found');

    const ticketNum = counterStore.next(group.name);
    const channelName = `ticket-${String(ticketNum).padStart(4, '0')}`;

    const ticketChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category as CategoryChannel,
        permissionOverwrites: [
            { id: guild.id, type: OverwriteType.Role, deny: [PermissionFlagsBits.ViewChannel] },
            {
                id: guild.client.user.id, type: OverwriteType.Member, allow: [
                    PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles,
                    PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageChannels,
                ]
            },
            {
                id: authorId, type: OverwriteType.Member, allow: [
                    PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles,
                ]
            },
            {
                id: group.staffRoleId, type: OverwriteType.Role, allow: [
                    PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory,
                    PermissionFlagsBits.AttachFiles, PermissionFlagsBits.ManageMessages,
                ], deny: [PermissionFlagsBits.SendMessages]
            },
            ...globalConfig.adminRoleIds.map((roleId) => ({
                id: roleId, type: OverwriteType.Role, allow: [
                    PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory,
                    PermissionFlagsBits.AttachFiles, PermissionFlagsBits.ManageMessages,
                ], deny: [PermissionFlagsBits.SendMessages]
            })),
        ],
        topic: `id=${authorId}|grp=${group.name}|num=${ticketNum}|topic=${topicLabel}`,
    });

    ticketStore.set(ticketChannel.id, {
        authorId, groupName: group.name, channelId: ticketChannel.id,
        openedAt: new Date(), hasUserMessages: false,
    });

    await sendTicketInterface(ticketChannel, authorId, group, topicLabel, answers);
    return ticketChannel.id;
}

// ── Ticket interface ──────────────────────────────────────────────────────

async function sendTicketInterface(
    channel: TextChannel, authorId: string, group: TicketGroup,
    topicLabel: string, answers: Record<string, string>,
): Promise<void> {
    const answerEntries = Object.entries(answers).filter(([, v]) => v.trim());

    const lines: string[] = [t.ticket_heading(topicLabel, group.displayName, authorId)];
    if (answerEntries.length > 0) {
        lines.push('');
        for (const [label, value] of answerEntries) {
            lines.push(`**${label}**`);
            lines.push(value.trim());
            lines.push('');
        }
    }

    const container = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(lines.join('\n').trim()))
        .addSeparatorComponents(new SeparatorBuilder().setDivider(false))
        .addActionRowComponents(
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setCustomId('close_ticket').setLabel(t.btn_close).setEmoji('🔒').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('claim_ticket').setLabel(t.btn_claim).setEmoji('🛡️').setStyle(ButtonStyle.Secondary),
            ),
        );

    await channel.send({ components: [container], flags: CV2 as any });
}

function txt(content: string): ContainerBuilder {
    return new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(content));
}
