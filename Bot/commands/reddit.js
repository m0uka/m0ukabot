
// Reddit command
const Discord = require('discord.js');
const config = require('../config.json');

const snoowrap = require('snoowrap'); // Reddit API

const r = new snoowrap({
    userAgent: 'm0ukaBot-discord-bot',
    clientId: 'stupid',
    clientSecret: 'stupid',
    username: 'm0ukaBot',
    password: 'stupid'
});



exports.run = async (client, message, [subreddit, type]) => {

    if (!subreddit) return message.channel.send(client.createEmbed(":x: Chyba", "#ff0000", "Nezadal jsi žádný subreddit."));

    if (subreddit.includes("r/"))
    {
        subreddit = subreddit.replace(/\//g, "") // odstanit lomítka
        subreddit = subreddit.substring(1); // odstranit první písmeno (r)
    }
    
    subreddit = encodeURI(subreddit); // enkodovat url

    var currSub;
    try {
    currSub = await r.getSubreddit(subreddit).fetch();
    }
    catch (err)
    {
        // nejspíš neexistuje...
        return message.channel.send(client.createEmbed(":x: Chyba", "#ff0000", "Tento subreddit nebyl nalezen. Prosím zkontroluj jeho jméno.."));
    }


    
    if (currSub.over18) {
        if (message.channel.type == "text") {
            if (!message.channel.nsfw) {
                return message.channel.send(client.createEmbed(":warning: NSFW subreddit", "#f4f142", `Tento subreddit (${currSub.display_name_prefixed}) je označený NSFW a proto se nezobrazil.\nPokud chceš aby tento subreddit fungoval, prosím používej tento subreddit v NSFW kanálu.`));
            }
        }
    }



    r.getRandomSubmission(subreddit).fetch().then(sub => {


        var title = sub.title;
        var text = sub.selftext;

        var subreddit = sub.subreddit_name_prefixed;
        var nsfw = sub.over_18;

        var url = sub.url;
        var isSelf = sub.is_self;
        var domain = sub.domain;

        var postHint = sub.post_hint;
        var embed;

        if (nsfw) {
            if (message.channel.type == "text") {
                if (!message.channel.nsfw) {
                    return message.channel.send(client.createEmbed(":warning: NSFW příspěvek", "#f4f142", "Tento příspěvek je označený NSFW a proto se nezobrazil.\nPokud chceš aby se tyto příspěvky zobrazovaly, prosím používej tento příkaz v NSFW kanálu."));
                }
            }
        }

        if (isSelf) {
            embed = new Discord.RichEmbed()
                .setAuthor("Reddit (" + subreddit + ")", "http://www.redditstatic.com/desktop2x/img/favicon/apple-icon-120x120.png")
                .setTitle(title)
                .setDescription(text)
        } else if (postHint == "image") {
            embed = new Discord.RichEmbed()
                .setAuthor("Reddit (" + subreddit + ")", "http://www.redditstatic.com/desktop2x/img/favicon/apple-icon-120x120.png")
                .setTitle(title)
                .setImage(url)
        } else {
            embed = new Discord.RichEmbed()
                .setAuthor("Reddit (" + subreddit + ")", "http://www.redditstatic.com/desktop2x/img/favicon/apple-icon-120x120.png")
                .setTitle(title)
                .setURL(url)
        }

        message.channel.send({ embed });

        client.consoleLog(`[Reddit] Uživatel ${message.author.username}#${message.author.discriminator} zobrazil náhodný post ze <b>${subreddit}</b>.`)


    })
        .catch(console.error);


}

exports.conf = {
    enabled: true,
    aliases: [],
};

exports.help = {
    name: "reddit",
    category: "Služby",
    description: "Zobraz nějaký post z nějakého subredditu",
    usage: "reddit [subreddit]"
};
