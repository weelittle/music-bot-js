const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const fs = require('node:fs')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('view the commands for this bot'),
    async execute(inter) {
        const client = inter.client

        const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

        msg = ''
        for (const file of commandFiles) {
            const cmd = require(`./${file}`)
            msg += `name: ${cmd.data.name}\ndescription: ${cmd.data.description}\n\n`
        }

        const embed = new EmbedBuilder()
            .setTitle('commands')
            .setDescription(msg)
            .setFooter({text: 'created by WEE LITTLE (Stoke upon gang 2022)'})
        await inter.reply({embeds: [embed], ephemeral: true})
    }
}