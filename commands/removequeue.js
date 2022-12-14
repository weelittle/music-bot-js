// remove a song from the queue in a particular position
const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removequeue')
        .setDescription('remove a song from a certain position in the queue')
        .addIntegerOption(option =>
            option
                .setName('pos')
                .setDescription('position of the song you want to remove from the queue')
                .setRequired(true))
        .setDMPermission(false),
    async execute(inter) {
        const player = inter.client.player
        const queue = player.getQueue(inter.guild)

        const pos = inter.options.getInteger('pos')

        try {
            const track = queue.remove(pos-1)
            await inter.reply('successfully removed song `' + track.title + '` from the queue')
        } catch {
            await inter.reply('failed to remove song from queue')
        }
    }
}