// this script deploys changes in slash commands (run this everytime you make changes to a slash command)

const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config');
const fs = require('fs');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);


(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);


        const data = await rest.put(
            // for guild-only commands: Routes.applicationGuildCommands(clientId, guildId)
            // for global commands: Routes.applicationCommands(clientId)
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error)
    }
})();