const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js")
const { ownerId } = require('../config')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('testing'),
    async execute(inter) {
        if (String(inter.user.id) !== String(ownerId)) { return await inter.reply({content: 'you cannot use this command', ephemeral: true})}

        const row = new ActionRowBuilder()
            .setComponents(
                new ButtonBuilder()
                    .setCustomId('customid')
                    .setLabel('test')
            )

        const embed = new EmbedBuilder()
            .setTitle('test')
            .setDescription('balls')
            .setFooter({text: 'hi'})
        await inter.reply({embeds: [embed], rows: [row]})
        await sleep(1000)
        const embed1 = new EmbedBuilder()
            .setTitle('test1')
            .setDescription('balls1')
            .setFooter({text: 'hi1'})
        await inter.editReply({embeds: [embed1]})
    }
    
}