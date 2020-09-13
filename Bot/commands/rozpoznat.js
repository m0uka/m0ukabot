
// Hello world command (for testing)
const Discord = require('discord.js');
const config = require('../config.json');


exports.run = async (client, message, args) => {

    if (message.attachments.size < 1 && !args[0]) return message.channel.send(client.createEmbed(":x: Chyba", "#ff0000", "Prosím přidej nějaký obrázek do attachmentu / zadej URL"));

    var Attachment = (message.attachments).array();
    var url = args[0] || Attachment[0].url;

    client.imageRecognition(message, url);
}

exports.conf = {
    enabled: true,
    aliases: [],
  };

  exports.help = {
    name: "rozpoznat",
    category: "System",
    description: "Rozpoznej obrázek",
    usage: "rozpoznat [url]"
  };