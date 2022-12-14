const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('check the queue for this server (interaction expires in 1 minute)')
        .setDMPermission(false),
    async execute(inter) {
        const client = inter.client
        const player = client.player

        const queue = player.getQueue(inter.guild)
        if (queue === undefined || queue === []) { return await inter.reply({content: 'there is currently no queue for this server', ephemeral: true}) }

        function getQueue(page) {
            let msg = ''

            if (page === 1) {
                const np = queue.nowPlaying()
                if (np) {
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

            if (inter.user !== interaction.user) {
                try {
                    interaction.reply({content: 'you cannot interact with someone elses message', ephemeral: true})
                } catch (err) {
                    console.log(err)
                }
                return
            }

            for (const x of buttonText) {
                const cid = interaction.customId

                if ('queue'+x === cid) {
                    if (cid === 'queue'+buttonText[0]) { // <<
                        if (currentPage-10 < 1) { 
                            try {
                                await interaction.reply({content: 'you cannot go to that page', ephemeral: true})
                            } catch (err) {
                                console.error(err)
                            }
                            return
                        }
                        currentPage -= 10
                    } else if (cid === 'queue'+buttonText[1]) { // <
                        if (currentPage-1 < 1) { 
                            try {
                                await interaction.reply({content: 'you cannot go to that page', ephemeral: true})
                            } catch (err) {
                                console.error(err)
                            }
                            return
                        }
                        currentPage -= 1
                    } else if (cid === 'queue'+buttonText[2]) { // >
                        if (currentPage+1 > maxPages) { 
                            try {
                                await interaction.reply({content: 'you cannot go to that page', ephemeral: true})
                            } catch (err) {
                                console.error(err)
                            }
                            return
                        }
                        currentPage += 1
                    } else if (cid === 'queue'+buttonText[3]) {// >>
                        if (currentPage+10 > maxPages) { 
                            try {
                                await interaction.reply({content: 'you cannot go to that page', ephemeral: true})
                            } catch (err) {
                                console.error(err)
                            }
                            return
                        }
                        currentPage += 10
                    }

                    if (getQueue(currentPage).length < 1) {
                        currentPage = 1
                    }
                    const newEmbed = new EmbedBuilder()
                            .setTitle(`Queue for ${inter.guild.name}`)
                            .setDescription(getQueue(currentPage))
                            .setFooter({text: `page ${currentPage} of ${maxPages} pages`})
                    try {
                        await interaction.update({embeds: [newEmbed]})
                    } catch (err) {
                        console.error(err)
                    }
                }
            }
        }

        client.on('interactionCreate', listener)

        await sleep(60000)
        client.removeListener('interactionCreate', listener)
    }
}