const config = require("../config.json");
const googleTTS = require('google-tts-api');

const servers = {};


module.exports.servers = servers;


exports.run = async (client, message, args) => {

    if (!servers[message.guild.id]) servers[message.guild.id] = {
        queue: []
    }

    var server = servers[message.guild.id];
	if (!message.member.voiceChannel) {
		return message.channel.send(":warning: **Musis byt v nejakem voice channelu!**");
    }

    let lang = 'cs';

    let msg;

    if (args.slice(-1)[0] == "en" || args.slice(-1)[0] == "cs")
    {
        args.pop();
        msg = args.join(" ");
    } else {
        msg = args.join(" ");
    }

    let tts;

    if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(async function(connection) {


    tts = await googleTTS(msg, lang, 1);

    console.log(tts);
    server.dispatcher = await connection.playArbitraryInput(tts);

    function endDispatcher()
    {
        server.dispatcher.end();
        connection.disconnect();
    }
    
    server.dispatcher.on("end", () => {
        setTimeout(() => endDispatcher(), 310); // trochu počkáme si ať se TTS dohraje (problémy s připojením)
    })


    

    })

}

exports.conf = {
    enabled: true,
    aliases: ["texttospeech", "mluv", "mluvit"],
  };

  exports.help = {
    name: "tts",
    category: "Zábava",
    description: "Využij Text to Speech",
    usage: "tts [výraz]"
  };