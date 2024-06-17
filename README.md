# Rere - Discord Reaction Retriever

Rere is a Discord bot that retrieves information from Discord message reactions, including the full list of users that gave the reactions. It is intended to complement and be used alongside other tools that gather information from Discord chats, such as [DiscordChatExporter](https://github.com/Tyrrrz/DiscordChatExporter). It is written in JavaScript, and uses [Discord.js v14](https://discord.js.org/). It runs using [Node.js](https://nodejs.org/).

Rere is used as a Discord bot, meaning you interact with it inside a Discord server to make it gather and export the desired information. Thus, Rere needs to be inside any server you want to collect information from, and must have access to the desired channels.

Rere works over full channels. It will search for reactions in all the messages in a given channel, and collect their information. **Please, bear in mind that message and reaction fetching are actions that may be rate-limited by Discord**. The process of collecting all the information related to reactions from a channel is rather slow. As a reference, in the tested scenarios, it took Rere ~8 seconds to fetch 1000 messages, and ~130 additional seconds to fetch all their reactions.

**This software comes without any warranty**, including that of compliance with Discord's Terms of Service (ToS). Use at your own risk.

Rere is currently in beta. Right now, the extracted reaction data is converted into HTML and saved in `./exported_data/<server name>.<channel name>.html`, as well as sent as attachment in a reply to the triggering command.

## Usage

Rere is used via Discord commands. You can trigger it by using the `/rere` command:
```
/rere #<some-channel>
```
Rere will collect all messages sent to the channel `#<some-channel>` and extract their reaction information.

Rere can also be used via "old-school Discord bot commands", i.e., using a custom command prefix. The custom command prefix is set by the environmental variable `PRE`. For example, with `PRE=!`, one can use:
```
!rere #<some-channel>
```
or just the channel name:
```
!rere <some-channel>
```
This will trigger Rere as previously descibed.

Bear in mind that the intended way of using the bot is with the slash (/) command.

## Setup

Download the source code, and install its dependencies by running on the root of the project:
```
npm install
```

If you want to use Rere via slash (/) commands (you most likely want this), create a config.json file with your bot's client ID (you can look that up on your bot's page in [Discord developer portal](https://discord.com/developers/applications)), like this:
```json
{
	"clientId": "<your bot's client ID>"
}
```
After creating the config.json file, execute the following on the root of the project:
```
node deploy-commands.js
```

**Execute Rere** in the background by running:
```
DISCORD_TOKEN=<your bot's token> PRE=<custom command's prefix> nohup node . 2>&1 &
```
If you do not intend to use Rere with old-school custom commands (only with slash commands), you may omit the `PRE` environmental variable.

For more information on deploying a bot with custom slash commands, see this Discord.js pages [on creating a Discord bot](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot), and [on adding a bot to servers](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links).

### Bot's permissions

This bot requires reading and sending messages in the server to work properly. Thus, when adding it to your server, do not forget to give it all the proper permissions related to that functionality.

**IMPORTANT**: As the bot requires reading messages to work, it is necessary to turn on the Message Content privileged intent inside the bot's page in the developer portal for it to work properly. See [this Discord.js page](https://discordjs.guide/popular-topics/intents.html#privileged-intents) for more information.

