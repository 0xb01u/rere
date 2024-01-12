const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId } = require('./config.json');
const { ChannelType } = require('discord.js');

const commands = [
	new SlashCommandBuilder()
		.setName('rere')
		.setDescription('Retrieves information related to message reactions from a given channel.')
		.addChannelOption(option =>
			option.setName('channel')
			.setDescription('The channel to retrieve message reactions information from.')
			.setRequired(true)
			.addChannelTypes(ChannelType.GuildText)),
].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

rest.put(Routes.applicationCommands(clientId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error)

