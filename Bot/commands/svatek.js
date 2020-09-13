const Discord = require('discord.js');
const config = require('../config.json');

const request = require('request');

exports.run = async (client, message, args) => {
    request('https://api.abalin.net/get/today?country=cz', { json: true }, (err, res, body) => {
    if (err) { return console.log(err); }
     message.channel.send(client.createEmbed("Dnes má svátek:", "#6bf442", body.data.name_cz));
    });
}

exports.conf = {
    enabled: true,
    aliases: ["svátek"],
  };

  exports.help = {
    name: "svatek",
    category: "Ostatní",
    description: "Zjistí kdo má dneska svátek",
    usage: "svatek"
  };