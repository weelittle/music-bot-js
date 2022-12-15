const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('stops the bot from playing and clears the queue'),
    async execute(inter) {
        const queue = inter.client.player.getQueue(inter.guild)

        if (!queue) { return await inter.reply({content: 'there is currently no queue', ephemeral: true}) }

        queue.destroy()
        await inter.reply('bot has been stopped')
    }
}