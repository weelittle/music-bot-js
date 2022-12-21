const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('pause the currently playing song'),
    async execute(inter) {
        const queue = inter.client.player.getQueue(inter.guild)

        if (!queue) { return await inter.reply({content: 'there is currently nothing playing', ephemeral: true}) }

        queue.setPaused(true)
        await inter.reply('current song has been paused')
    }
}