const { SlashCommandBuilder, ButtonBuilder, EmbedBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js')
const { QueryType } = require('discord-player')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('play a song')
        .addStringOption(option => 
            option
                .setName('query')
                .setDescription('input search/url/playlist_url')
                .setRequired(true)),
    async execute(inter) {
        if (!inter.member.voice.channel) {
            return await inter.reply({content: 'you must be in a voice channel', ephemeral: true});
        }
        if (inter.guild.members.me.voice.channelId && inter.member.voice.channelId !== inter.guild.members.me.voice.channelId) {
            return await inter.reply({content: 'you are not in the same vc', ephemeral: true});
        }

        const client = inter.client;
        const player = client.player;

        const query = inter.options.getString('query');
        const queryStr = "`" + query + "`"
        const queue = player.createQueue(inter.guild, {
            metadata: {
                channel: inter.channel
            }
        });

        try {
            if (!queue.connection) await queue.connect(inter.member.voice.channel);
        } catch (err) {
            queue.destroy();
            console.error(err);
            return await inter.reply({content: 'could not join vc', ephemeral: true});
        }
        
        if (query.includes('https://') && !query.includes('&list')) {
            const result = await player.search(query, {
                requestedBy: inter.user,
                searchEngine: QueryType.YOUTUBE_VIDEO
            })
            if (result.tracks.length === 0) {
                return inter.reply({content: `no results for query ${queryStr}`, ephemeral: true})
            }
            const song = result.tracks[0]
            await queue.addTrack(song)

            const titleStr = "`" + song.title + "`"
            inter.reply(`track ${titleStr} added to queue`)
        } else if (query.includes('https://') && query.includes('&list')) {
            const result = await player.search(query, {
                requestedBy: inter.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST
            })
            if (result.tracks.length === 0) {
                return inter.reply({content: `no results for query ${queryStr}`, ephemeral: true})
            }
            const playlist = result.playlist
            await queue.addTracks(result.tracks)

            const titleStr = "`" + playlist.title + "`"
            await inter.reply(`playlist ${titleStr} added (${result.tracks.length} songs)`)
        } else {
            const result = await player.search(query, {
                requestedBy: inter.user,
                searchEngine: QueryType.YOUTUBE_SEARCH
            })

            function LoadSearchQuery(page) {
                let msg = ''
                const offset = (page-1)*5
                const results = result.tracks
                for (var i=0; i<5; i++) {
                    const track = results[i+offset]
                    if (track === undefined) { break; }

                    const title = '`' + track.title + '`'
                    const author = '`' + track.author + '`'
                    const duration = '`' + track.duration + '`'
                    msg += `${i+1+offset} - ${title} ${duration} [link](${track.url})\nauthor: ${author}\n`
                }

                return msg
            }
            
            let currentPage = 1
            const maxPages = Math.ceil(result.tracks.length/5)
            const embed = new EmbedBuilder()
                .setTitle(`Search Results for ${query} (${result.tracks.length})`)
                .setDescription(LoadSearchQuery(currentPage))
                .setFooter({text: `${currentPage} of ${maxPages} pages`})

            const row = new ActionRowBuilder()
            const row2 = new ActionRowBuilder()
            const buttonText = ['1','2','3','4','5','<','>']
            for (const x of buttonText) {
                const button = new ButtonBuilder()
                    .setCustomId('play'+x)
                    .setLabel(x)
                    .setStyle(ButtonStyle.Primary)
                
                if (row.components.length === 5) { row2.addComponents(button) } else { row.addComponents(button) }
            }

            await inter.reply({embeds: [embed], components: [row, row2]})
            
            let responded = false
            let msg

            var listener = async interaction => {
                if (responded) return
                if (!interaction.isButton()) return

                for (const x of buttonText) {
                    const cid = interaction.customId
                    
                    if ('play'+x === cid) {
                        if (cid !== 'play'+buttonText[5] && cid !== 'play'+buttonText[6]) { // not < or >
                            const offset = (currentPage-1)*5
                            const song = result.tracks[(parseInt(x)+offset)-1]
                            if (song === undefined) { return interaction.reply({content: 'this song does not exist', ephemeral: true}) }
                            responded = true
                            await inter.editReply({content: 'added `' + song.title + '` to queue', embeds: [], components: []})

                            await queue.addTrack(song)
                            if (!queue.playing) await queue.play()

                            client.removeListener('interactionCreate', listener)
                        } else if (cid === 'play'+buttonText[5]) { // <
                            msg = interaction.message
                            if (currentPage === 1) { return interaction.reply({content: 'you cannot go that way', ephemeral: true})}
                            currentPage -= 1
                            const newEmbed = new EmbedBuilder()
                                .setTitle(`Search Results (${result.tracks.length})`)
                                .setDescription(LoadSearchQuery(currentPage))
                                .setFooter({ text: `${currentPage} of ${maxPages} pages` })
                            await interaction.update({embeds: [newEmbed]})
                        } else if (cid === 'play'+buttonText[6]) { // >
                            msg = interaction.message
                            if (currentPage === maxPages) { return interaction.reply({content: 'you cannot go that way', ephemeral: true})}
                            currentPage += 1
                            const newEmbed = new EmbedBuilder()
                                .setTitle(`Search Results for ${query} (${result.tracks.length})`)
                                .setDescription(LoadSearchQuery(currentPage))
                                .setFooter({text: `${currentPage} of ${maxPages} pages`})
                            await interaction.update({embeds: [newEmbed]})
                        }
                    }
                }
            }

            client.on('interactionCreate', listener)

            await sleep(30000)
            if (!responded) {
                if (msg !== undefined) {
                    await msg.edit({content: 'did not reply fast enough', embeds: [], components: []})
                } else {
                    await inter.editReply({content: 'did not reply fast enough', embeds: [], components: []})
                }
                try {
                    client.removeListener('interactionCreate', listener)
                } catch (err) {
                    console.log('listener already removed')
                }
            }
            return
        }

        if (!queue.playing) await queue.play()
    }
}