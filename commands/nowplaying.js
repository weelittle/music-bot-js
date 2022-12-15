const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('shows the currently playing song')
        .setDMPermission(false),
    async execute(inter) {
        const client = inter.client
        const player = client.player
        const queue = player.getQueue(inter.guild)

        if (!queue) { return await inter.reply({content: 'there is currently no queue', ephemeral: true}) }

        const np = queue.nowPlaying()

        if (!np) { return await inter.reply({content: 'i am currently not playing anything', ephemeral: true}) }

        const pos = queue.getPlayerTimestamp()
        const bar = queue.createProgressBar()
        const embed = new EmbedBuilder()
            .setTitle('currently playing')
            .setDescription(
                '`' + np.title + '` `' + `${pos['current']}/${pos['end']}` + '` [link]' + `(${np.url})` + '\n\n' + `${bar}`
            )
            .setFooter({text: 'Stoke-upon-trent®'})

        await inter.reply({embeds: [embed]})
    }
}