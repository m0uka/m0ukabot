const Discord = require('discord.js');


exports.run = async (client, message, args) => {

    var blacklist = client.blacklist.get(message.author.id);

    if (blacklist != null)
      if (blacklist.reportBlackList) return message.channel.send(client.createEmbed(":x: Máš zakázáno posílat bug reporty.", "#ff0000", ""));

    if (!args[0]) return message.channel.send(client.createEmbed(":x: Nic jsi nenahlásil!", "#f44141", ""));

    if (client.cmdUsedRecently.has(message.author.id))
        return message.channel.send(client.createEmbed(":hourglass_flowing_sand: Musíš počkat minutu před použitím tohoto příkazu!", "#FF0000", ""))

    client.addCooldown(message.author.id, 60000);




    var msg = args.join(" ");
    var owner = client.users.get('299170508623314967');

    client.consoleLog(`[Bugy] Uživatel ${message.author.username} nahlásil bug: <span class="text-info">"${msg}"</span>`);

    const embed = new Discord.RichEmbed()
    .setTitle("Nahlášení bugu")
    .setColor("#ea2812")
    .setDescription(msg)
    .setAuthor(message.author.username + "#" + message.author.discriminator + " (" + message.author.id + ")", message.author.avatarURL)
    owner.send({embed})
    .then(function(msg)
    {
      msg.react("⚠");
    })


}

exports.conf = {
    enabled: true,
    aliases: ["nahlasbug", "nahlasit"],
  };

  exports.help = {
    name: "nahlasitbug",
    category: "System",
    description: "Nahlaš bug",
    usage: "nahlasitbug [bug]"
  };