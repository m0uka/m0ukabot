const config = require('../config.json');

exports.run = async (client, message, args) => {

  if (message.author.id !== config.ownerid) return;

  const [title, ...content] = args;

  let color = "#42c8f4";

  client.guilds.forEach(async function (guild) {

    var guildQuery = "SELECT prefix, annouceChannel FROM settings WHERE id = " + guild.id;
    var guildid;
    client.mysql.query(guildQuery, async function (err, result) {
      if (err) throw err;

      guildid = result[0];

      let msgcontent = content.join(" ");

      msgcontent = msgcontent.replace(/pref!/g, guildid.prefix);

      let channel = await guild.channels.find("name", guildid.annouceChannel);

      if (!channel) return;


      if (channel.type == "text")
        channel.send(client.createEmbed(title, color, msgcontent));

    });
  })
}

exports.conf = {
  enabled: true,
  aliases: ["broadcast", "sdělení", "sdělit"],
};

exports.help = {
  name: "sdeleni",
  category: "System",
  description: "Odešli sdělení (Majitel bota)",
  usage: "sdeleni [nadpis] [zprava] [barva]"
};