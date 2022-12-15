//shuffle the playlist (watch video maybe)
const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('shuffle the current queue'),
    async execute(inter) {
        const player = inter.client.player
        const queue = player.getQueue(inter.guild)

        if (!queue) { return await inter.reply({content: 'there is currently no queue for this server', ephemeral: true}) }

        queue.shuffle()
        await inter.reply('queue has been successfully shuffled')
    }
}