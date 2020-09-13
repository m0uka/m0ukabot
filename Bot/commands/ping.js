
// Ping příkaz :)
const Discord = require('discord.js');
const config = require('../config.json');


exports.run = async (client, message, [mention, ...reason]) => {

    return message.channel.send(client.createEmbed(":ping_pong: Ping", "#41bef4", `Websocket: **${client.pings[0]}ms**\nOdezva: **${new Date().getTime() - message.createdTimestamp}ms**`));

}

exports.conf = {
    enabled: true,
    aliases: ["odezva"],
  };

  exports.help = {
    name: "ping",
    category: "System",
    description: "Zjisti odezvu bota",
    usage: "ping"
  };