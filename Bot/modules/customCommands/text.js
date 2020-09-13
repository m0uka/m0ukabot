const Discord = require('discord.js');

const moment = require('moment');

exports.run = async (client, message, args, cmd) => {
    var code = cmd.code;
    
    var response = code.response;

    response = response.replace(/{uzivatel}/g, message.author.username);
    response = response.replace(/{server}/g, message.guild.name);
    response = response.replace(/{cas}/g, moment().locale('cs').format('LT'));
    response = response.replace(/{datum}/g, moment().locale('cs').format('LL'));
    response = response.replace(/{prefix}/g, client.serversPrefixes.find(obj => obj.id == message.guild.id));

    if (code.type == "embed")
    {
        message.channel.send(client.createEmbed(response, "#4286f4", ""));
    } else {
        message.channel.send(response);
    }
}