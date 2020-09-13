const { version } = require("discord.js");
const moment = require("moment");
require("moment-duration-format");

exports.run = (client, message, args, level) => { // eslint-disable-line no-unused-vars
  const duration = moment.duration(client.uptime).format(" D [dní], H [hodin], m [minut], s [sekund]");
  message.channel.send(`= STATISTIKY =
• Využití RAM :: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
• Spuštěno    :: ${duration}
• Uživatelů   :: ${client.users.size.toLocaleString()}
• Serverů     :: ${client.guilds.size.toLocaleString()}
• Channelů    :: ${client.channels.size.toLocaleString()}
• Discord.js  :: v${version}
• Node        :: ${process.version}`, {code: "asciidoc"});
};

exports.conf = {
  enabled: true,
  aliases: ["stats", "botinfo", "bot"],
};

exports.help = {
  name: "statistiky",
  category: "Ostatní",
  description: "Nějaké užitečné statistiky",
  usage: "statistiky"
};