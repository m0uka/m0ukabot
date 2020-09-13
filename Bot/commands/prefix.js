
const config = require('../config.json');

exports.run = async (client, message, args) => {
    const guildConf = client.settings.get(message.guild.id);

    if (!args[0])
      return message.channel.send(client.createEmbed("Aktuální prefix: " + guildConf["prefix"], "#42f4a4", ""))


    if(!await client.checkPermission(message.member)) return message.channel.send(client.createEmbed("Nemáš dostatečná práva!", "#FF0000", ""))


    guildConf["prefix"] = args[0];

    client.settings.set(message.guild.id, guildConf);

    message.channel.send(client.createEmbed(`Prefix byl změněn na: \`${args[0]}\``, "#41f483", ""));
}

exports.conf = {
    enabled: true,
    aliases: [],
  };

  exports.help = {
    name: "prefix",
    category: "System",
    description: "Změň prefix (pouze pro admin role)",
    usage: "prefix [command]"
  };