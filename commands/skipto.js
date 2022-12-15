const { SlashCommandBuilder, PermissionsBitField } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skipto')
        .setDescription('skip to a song in the queue (perms needed)')
        .addIntegerOption(option =>
            option
                .setName('destination')
                .setDescription('num in queue you want to skip to')
                .setRequired(true))
        .setDMPermission(false),
    async execute(inter) {
        const client = inter.client
        const player = client.player
        const queue = player.getQueue(inter.guild)
        const num = inter.options.getInteger('destination')

        if (!inter.member.permissions.has([PermissionsBitField.Flags.ManageChannels])) {
            return await inter.reply({content: 'you do not have permission to run this command (manage channels)', ephemeral: true})
        }

        if (!queue.tracks[num-1]) {
            return await inter.reply({content: 'invalid number', ephemeral: true})
        }
        queue.skipTo(num-1)
        await inter.reply(`successfully skipped to number ${num} in the queue`)
    }
}