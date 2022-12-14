const { SlashCommandBuilder, PermissionsBitField } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('vote to skip for the currently playing song'),
    async execute(inter) {
        const client = inter.client
        const player = client.player
        const queue = player.getQueue(inter.guild)

        if (!inter.member.voice.channel) { return await inter.reply({content: 'you are not in a voice channel', ephemeral: true}) }
        if (inter.guild.members.me.voice.channelId && inter.member.voice.channelId !== inter.guild.members.me.voice.channelId) {
            return await inter.reply({content: 'you are not in the same vc', ephemeral: true});
        }
        if (!queue.playing) { return await inter.reply({content: 'i am currently not playing anything', ephemeral: true}) }

        if (inter.member.permissions.has([PermissionsBitField.Flags.ManageChannels]) || queue.nowPlaying().requestedBy === inter.user) {
            queue.skip()
            return await inter.reply('successfully skipped the current song')
        }
        
        if (!queue.skips) {
            console.log('skips not found, creating...')
            queue.skips = []
        }

        if (queue.skips.includes(inter.user.id)) {
            return await inter.reply({content: 'you have already voted to skip', ephemeral: true})
        }

        const vc_size = inter.guild.members.me.voice.channel.members.size-1
        let max_skips = 3
        if (vc_size < 3) {
            max_skips = 1
        }

        queue.skips.push(inter.user.id)

        if (queue.skips.length >= max_skips) {
            queue.skip()
            queue.skips = []
            await inter.reply('successfully skipped the current song')
        } else {
            await inter.reply(`you have voted to skip the song, ${max_skips - queue.skips.length} votes left`)
        }
    }
}