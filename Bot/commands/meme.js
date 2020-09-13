const Discord = require('discord.js');
//const Jimp = require('jimp');

var memeDir = "./modules/memes/";
var imgActive = "./modules/memes/active/active.jpg"

exports.run = async (client, message, args) => {

    switch (args[0].toLowerCase())
    {
        case "brain":
        case "mozek":

            Jimp.read(memeDir + "brain/brain.jpg")
            .then(tpl => (tpl.clone().write(imgActive)))

            .then(() => (Jimp.read(imgActive)))
            
            //todo dodělat

        break;
    }
}

exports.conf = {
    enabled: true,
    aliases: ["vytvormeme"],
  };

  exports.help = {
    name: "meme",
    category: "Zábava",
    description: "Vytvoř si vlastní meme!",
    usage: "meme [meme] [argumenty]"
  };
