const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('ping the bot'),
    async execute(interaction) {
        await interaction.reply({content: interaction.client.ws.ping + ' ms', ephemeral: true});
    }
};