const Discord = require('discord.js');

exports.run = (client, member) => {
    var sqlQuery = "SELECT welcomeChannel, welcomeMessage FROM settings WHERE id = " + member.guild.id;

    client.mysql.query(sqlQuery, function (err, result) {
        var thisGuild = result[0];
        var channel = member.guild.channels.find(ch => ch.name == thisGuild.welcomeChannel);

        if (!channel) return;

        var welcomeMessage = thisGuild.welcomeMessage;

        welcomeMessage = welcomeMessage.replace(/{{user}}/g, member.displayName);

        channel.send(welcomeMessage);
    });
}