const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('check the queue for this server (interaction expires in 1 minute)'),
    async execute(inter) {
        const client = inter.client
        const player = client.player

        const queue = player.getQueue(inter.guild)
        if (queue === undefined || queue === []) { return await inter.reply({content: 'there is currently no queue for this server', ephemeral: true}) }

        function getQueue(page) {
            let msg = ''

            if (page === 1) {
                const np = queue.nowPlaying()
                if (!np === undefined) {
                    const pos = queue.getPlayerTimestamp()
                    msg += 'Currently playing: `' + np.title + '` `' + `${pos['current']}/${pos['end']}` + '` [link]'+ `(${np.url})` +'\nauthor: `' + np.author + '` \n\n'
                }
            }
            const offset = (page-1)*5
            for (var i=0; i<5; i++) {
                const song = queue.tracks[i+offset]
                if (song === undefined) { break }

                msg += `${i+1+offset} -` + '`' + song.title + '` `' + song.duration + '` [link]'+`(${song.url})`+'\nauthor: `' + song.author + '`\n'
            }

            return msg
        }

        let currentPage = 1
        const maxPages = Math.ceil(queue.tracks.length/5)
        const embed = new EmbedBuilder()
            .setTitle(`Queue for ${inter.guild.name}`)
            .setDescription(getQueue(currentPage))
            .setFooter({text: `page ${currentPage} of ${maxPages}`})

        const row = new ActionRowBuilder()
        const buttonText = ['<<','<','>','>>']
        for (const x of buttonText) {
            const button = new ButtonBuilder()
                .setCustomId('queue'+x)
                .setLabel(x)
                .setStyle(ButtonStyle.Primary)
            
            row.addComponents(button)
        }

        await inter.reply({embeds: [embed], components: [row]})

        var listener = async interaction => {
            if (!interaction.isButton()) { return }

            for (const x of buttonText) {
                const cid = interaction.customId

                if ('queue'+x === cid) {
                    if (cid === 'queue'+buttonText[0]) { // <<
                        if (currentPage-10 < 1) { return await interaction.reply({content: 'you cannot go to that page', ephemeral: true}) }
                        currentPage -= 10
                        if (getQueue(currentPage) === '') {
                            currentPage = 1
                        }
                    } else if (cid === 'queue'+buttonText[1]) { // <
                        if (currentPage === maxPages) { return await interaction.reply({content: 'you cannot go to that page', ephemeral: true}) }
                        currentPage -= 1
                        if (getQueue(currentPage) === '') {
                            currentPage = 1
                        }
                    } else if (cid === 'queue'+buttonText[2]) { // >
                        if (currentPage === maxPages) { return await interaction.reply({content: 'you cannot go to that page', ephemeral: true}) }
                        currentPage += 1
                        if (getQueue(currentPage) === '') {
                            currentPage = 1
                        }
                    } else if (cid === 'queue'+buttonText[3]) {// >>
                        if (currentPage+10 > maxPages) { return await interaction.reply({content: 'you cannot go to that page', ephemeral: true}) }
                        currentPage += 10
                        if (getQueue(currentPage) === '') {
                            currentPage = 1
                        }
                    }
                    const newEmbed = new EmbedBuilder()
                            .setTitle(`Queue for ${inter.guild.name}`)
                            .setDescription(getQueue(currentPage))
                            .setFooter({text: `page ${currentPage} of ${maxPages} pages`})
                    await interaction.update({embeds: [newEmbed]})
                }
            }
        }

        client.on('interactionCreate', listener)

        await sleep(60000)
        client.removeListener('interactionCreate', listener)
    }
}