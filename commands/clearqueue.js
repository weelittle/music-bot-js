const { SlashCommandBuilder, PermissionsBitField } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearqueue')
        .setDescription('clears the queue (perms required)')
        .setDMPermission(false),
    async execute(inter) {
        if (!inter.member.permissions.has([PermissionsBitField.Flags.ManageChannels])) { 
            return await inter.reply({content: 'you do not have permission to use this command (manage channels)', ephemeral: true})
        }

        const player = inter.client.player
        const queue = player.getQueue(inter.guild)

        queue.clear()
        await inter.reply('successfully cleared the queue')
    }
}