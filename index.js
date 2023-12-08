const Discord = require("discord.js");
const fs = require("fs");
const { performance } = require("perf_hooks");

const bot = new Discord.Client({
	intents: [
		Discord.GatewayIntentBits.Guilds,
		Discord.GatewayIntentBits.GuildMessages,
		Discord.GatewayIntentBits.MessageContent,
	],
});
bot.login(process.env.DISCORD_TOKEN);

bot.on("ready", async () => {
	console.log(`${bot.user.tag} is online.`);
});

bot.on("messageCreate", async (msg) => {
	if (msg.author.bot) return;
	if (!msg.content.startsWith(process.env.PRE)) return;

	const args = msg.content
		.substring(process.env.PRE.length)
		.replaceAll("\n", " ")
		.split(" ");
	const cmd = args.shift().toLowerCase();
	if (cmd !== "rere") return;

	const channel = args.shift();
	const messages = await getChannelMessages(channel, msg.guildId);
	// If an error ocurred, false was returned:
	if (!messages) {
		msg.reply(
			`Channel ${channel} is not a valid text channel on this server, or I cannot access its messages for some reason.`
		);
		return;
	}

	const extractedReactions = await extractReactions(messages);

	console.log(extractedReactions);
	console.log(extractedReactions.length);
});

bot.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;
	if (commandName.toLowerCase() !== "rere") return;
	
	await interaction.reply({
		content: "Trying to find the channel and fetch its messages; please wait...",
		ephemeral: true
	});

	const channel = interaction.options.get("channel").value;

	const messages = await getChannelMessages(channel, interaction.guildId);
	// If an error ocurred, false was returned:
	if (!messages) {
		interaction.followUp({
			content: `Channel <#${channel}> is not a valid text channel on this server, or I cannot access its messages for some reason.`,
			ephemeral: true

		});
		return;
	}

	interaction.followUp({
		content: "Messages fetched. Please wait a few minutes while their reactions are retrieved...",
		ephemeral: true
	});

	const extractedReactions = await extractReactions(messages);

	console.log(extractedReactions);
	console.log(extractedReactions.length);

	interaction.followUp({
		content: "Done!",
		ephemeral: true
	});
});

async function getChannelMessages(channelNameOrID, guildId) {
	let channel;
	if (channelNameOrID.startsWith("<#") || !isNaN(channelNameOrID)) {
		// Find the channel by ID:
		channel = bot.channels.cache.find(
			(ch) => ch.id === (isNaN(channelNameOrID) ? channelNameOrID.slice(2, -1) : channelNameOrID)
		);
	} else {
		// Find the channel by name:
		channel = bot.channels.cache.find(
			(ch) => ch.name === channelNameOrID && ch.guild.id === guildId
		);
	}
	if (channel === undefined) return false;

	try {
		// Fetch more than 100 messages (default limit of fetch()):
		return await bulkMessageFetcher(channel);
	} catch (error) {
		console.log(
			`Could not fetch messages for channel ${channel.name}: ${error}`
		);
		return false;
	}
}

// Fetch up to 1000 messages from the channel:
async function bulkMessageFetcher(channel) {
	const start = performance.now();
	const allMessages = [];
	let last;

	const options = { limit: 100 };
	while (true) {
		if (last) options.before = last;

		const messages = await channel.messages.fetch(options);
		allMessages.push(...messages.values());
		console.log(
			`Messages fetched from ${channel.guild.name}#${channel.name}: ${allMessages.length}`
		);
		last = messages.last().id;

		if (messages.size != 100) break;
	}
	const end = performance.now();
	console.log(
		`Fetched ${allMessages.length} messages in ${(end - start) / 1000.0} seconds.`
	);

	return allMessages;
}

async function extractReactions(messages) {
	const start = performance.now();
	const reactions = [];

	for (const msg of messages) {
		for (const reaction of msg.reactions.cache.values()) {
			// Get the emoji:
			const emoji = reaction.emoji.name;

			// Get the message id:
			const msgId = msg.id;

			// Get the users who reacted with the emoji:
			const users = await reaction.users.fetch();
			const usrIds = users.map((usr) => {
				if (usr instanceof Discord.User) {
					return usr.id;
				}
				return null;
			}).filter(Boolean);
			const usrNames = users.map((usr) => {
				if (usr instanceof Discord.User) {
					return usr.tag;
				}
				return null;
			}).filter(Boolean);
			const reactingUsers = usrIds.map((id, i) => {
				return { id: id, tag: usrNames[i] };
			});

			// Add the reaction to the array:
			reactions.push({ msgId, emoji, reactingUsers });
		}
	}
	const end = performance.now();
	console.log(
		`Retrieved all reactions for ${messages.length} messages in ${(end - start) / 1000.0} seconds.`
	);

	return reactions;
}
