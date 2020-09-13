
// Hello world příkaz
const Discord = require('discord.js');
const config = require('../config.json');


exports.run = (client, message, args) => {

    message.channel.send(client.createEmbed("Hello World", "#00AE86", ""));
    
}

exports.conf = {
    enabled: true,
    aliases: [],
  };

  exports.help = {
    name: "hello",
    category: "System",
    description: "Ahoj, světe!",
    usage: "hello"
  };