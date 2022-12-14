const { SlashCommandBuilder } = require('discord.js')
const { QueueRepeatMode } = require('discord-player')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('toggles looping for songs')
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('type')
                .setDescription('loop current queue or current track')
                .addChoices(
                    {name: 'TRACK', value: 'track'},
                    {name: 'QUEUE', value: 'queue'},
                    {name: 'OFF', value: 'off'}
                )
                .setRequired(true)),
    async execute(inter) {
        const player = inter.client.player
        const queue = player.getQueue(inter.guild)
        
        const loop_name = inter.options.getString('type')
        let loop_type = QueueRepeatMode.OFF
        switch(loop_name) {
            case 'track':
                loop_type = QueueRepeatMode.TRACK
                break;
            case 'queue':
                loop_type = QueueRepeatMode.QUEUE
        }

        if (!queue) { return await inter.reply('a queue currently does not exist') }

        queue.setRepeatMode(loop_type)
        await inter.reply(`repeat mode successfully set to ${loop_name}`)
    }
}