
// Ascii command
const Discord = require('discord.js');
const config = require('../config.json');
const ascii = require('ascii-art');


exports.run = (client, message, args) => {

    ascii.font(args.join(' '), 'Doom', function(rendered) {

        rendered = rendered.trimRight();

        if (rendered.length > 2000) return message.channel.send(client.createEmbed(":x: Tvůj text je přílíš dlouhý", "#ff0000", ""))

        message.channel.send(rendered, {
            code: 'md'
        });
    });
    
}

exports.conf = {
    enabled: true,
    aliases: [],
  };

  exports.help = {
    name: "ascii",
    category: "Zábava",
    description: "Udělej z textu ascii art",
    usage: "ascii [text]"
  };