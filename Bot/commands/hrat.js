const config = require("../config.json");

const Discord = require('discord.js');

const ytdl = require('ytdl-core');
const search = require('youtube-search');
const moment = require('moment');
const ypi = require('youtube-playlist-info');

moment.locale("cs");

const servers = {};

function RemoveParameterFromUrl(url, parameter) {
    return url
        .replace(new RegExp('[?&]' + parameter + '=[^&#]*(#.*)?$'), '$1')
        .replace(new RegExp('([?&])' + parameter + '=[^&]*&'), '$1');
}


module.exports.servers = servers;


async function play(client, connection, message) {

    function nextSong() {
        if (server.queue[0]) play(client, connection, message);
        else {
            connection.disconnect();
        }
    }

    var server = servers[message.guild.id];


    await ytdl.getInfo(server.queue[0], async function (err, info) {

        if (err) {
            let server = servers[message.guild.id];


            if (server && server.dispatcher) {
                server.queue.shift();
                server.users.shift();
                setTimeout(() => nextSong(), 110)
            }

            console.log(err);

            client.consoleError("Hudba", err);
            message.channel.send(client.createEmbed(":x: Chyba", "#ff0000", "Nastala chyba v přehrávání hudby: " + err.name));
            return;
        }

        if (info) {
            console.log(info);
            var title = info.player_response.videoDetails.title;
            var url = server.queue[0];
            const embed = new Discord.RichEmbed()
                .setColor(0x00AE86)
                .setTitle(":musical_note: Nyní hraje:")
                .setDescription("**" + title + "**")
                .setTimestamp()
                .setFooter("Přehrál: " + server.users[0].username)
                .setThumbnail(info.thumbnail_url)
            message.channel.send({ embed });
            let now = new moment();
            now.locale('cs');
            console.log(`[${moment().add(2, 'hours').format('LT')}] ${server.users[0].username} prehral song ${title}.`);
            client.consoleLog(`[Hudba] Uživatel ${server.users[0].username}#${server.users[0].discriminator} přehrál: ${url}`);
            server.dispatcher = connection.playStream(ytdl(server.queue[0], { filter: "audioonly" }));


            server.dispatcher.on("end", () => {
                if (server.repeat) {
                    server.queue.push(server.queue[0]);
                    server.queue.shift();
                    server.users.push(server.users[0]);
                    server.users.shift();
                } else {
                    server.queue.shift();
                    server.users.shift();
                }


                setTimeout(() => nextSong(), 150)
            });

            server.dispatcher.on("error", (error) => {
                console.log(error);
                client.consoleError("Hudba", error);
                message.channel.send(client.createEmbed(":x: Chyba", "#ff0000", "Nastala chyba v dispatcheru: " + err.message + ",\npřeskakuji"));
                server.queue.shift();
                server.users.shift();

                setTimeout(() => nextSong(), 110)
            });
        } else {
            server.queue.shift();
            server.users.shift();
            setTimeout(() => nextSong(), 110)
            message.channel.send(client.createEmbed(":x: Chyba", "#ff0000", "Nastala chyba při získávání YTDL info.."));
        }

        if (server.collector)
            server.collector.stop();

        server.collector = message.channel.createMessageCollector(m => m);


        server.collector.on('collect', m => {

            var SQLQuery = "SELECT prefix FROM settings WHERE id = " + message.guild.id;
            client.mysql.query(SQLQuery, async function (err, result) {

                var thisConf = result[0];

                if (m.content.startsWith(thisConf.prefix + 'skip')) {
                    let server = servers[message.guild.id];
                    server.dispatcher.end();
                }
                if (m.content.startsWith(thisConf.prefix + 'odebrat')) {
                    // odebrání písničky kompletně (v repeatu už nebude)
                    let server = servers[message.guild.id];
                    if (!server.repeat) {
                        server.dispatcher.end();
                    } else {
                        server.queue.shift();
                        server.users.shift();
                    }
                }
                if (m.content.startsWith(thisConf.prefix + 'stop')) {
                    let server = servers[message.guild.id];
                    server.queue = [];
                    server.users = [];
                    server.dispatcher.end();
                }
                if (m.content.startsWith(thisConf.prefix + 'opakovat') || m.content.startsWith(thisConf.prefix + 'repeat')) {
                    let server = servers[message.guild.id];
                    if (!server.repeat) server.repeat = false;

                    server.repeat = !server.repeat;

                    var userInfo = "";

                    if (server.repeat) {
                        userInfo = "opakují";
                    } else {
                        userInfo = "neopakují";
                    }

                    message.channel.send(client.createEmbed(":repeat: Opakovat", "#a6f441", "Písničky ve frontě se nyní **" + userInfo + "**."));

                }
                if (m.content.startsWith(thisConf.prefix + 'queue') || m.content.startsWith(thisConf.prefix + 'fronta')) {
                    let server = servers[message.guild.id];

                    var loadingIcon = await client.emojis.find("name", "loadingm0uka");


                    message.channel.send(client.createEmbed(`${loadingIcon} Chvilku strpení...`, "#41f4c7", ""))
                        .then(async function (msg) {

                            var songs = [];



                            for await (url of server.queue) {
                                var info = await ytdl.getInfo(url);
                                songs.push(info.title);
                            }

                            console.log(songs);

                            const embed = new Discord.RichEmbed()
                                .setTitle("Fronta")
                                .setColor('#bcf442')
                                .setDescription(songs.join(", "))
                            message.channel.send({ embed });
                            msg.delete(1);
                        })
                }
            })
        })
    })


}


exports.run = async (client, message, args) => {

    var server = servers[message.guild.id];
    if (!message.member.voiceChannel) {
        return message.channel.send(":warning: **Musíš být v nějakém voice channelu!**");
    }
    if (!servers[message.guild.id]) servers[message.guild.id] = {
        queue: [],
        users: []
    }
    if (client.cmdUsedRecently.has(message.author.id))
        return message.channel.send(client.createEmbed(":hourglass_flowing_sand: Musíš počkat 5 vteřin před použitím tohoto příkazu!", "#FF0000", ""))

    client.addCooldown(message.author.id);

    let title;


    if (ytdl.validateURL(args[0])) {
        // URL inserted
        await ytdl.getInfo(args[0], async function (err, info) {
            // get info
            if (err) {
                console.log(err);
                message.channel.send(client.createEmbed(":x: Chyba", "#ff0000", "Nastala chyba ve zjišťování detailů.."));
                client.consoleError("Hudba", err);
                return;
            }

            var server = servers[message.guild.id];


            if (args[0].includes("&list=")) {
                var firstIndex = args[0].indexOf("&list=") + 6;
                var playlistId = args[0].substring(firstIndex, args[0].lastIndexOf(args[0].slice(-1)) + 1);
                playlistId = RemoveParameterFromUrl(playlistId, 'index'); // |
                playlistId = RemoveParameterFromUrl(playlistId, 't'); // |-- Odebrání query, aby bylo ID validní
                console.log(playlistId);
                var itemCount = 0;
                await ypi("xxx", playlistId).then(items => {
                    items.forEach(function (item) {
                        itemCount++;
                        server.queue.push("https://www.youtube.com/watch?v=" + item.resourceId.videoId);
                        server.users.push(message.author);
                    })
                }).catch(console.error);

                message.channel.send(client.createEmbed(":white_check_mark: Přidáno " + itemCount + " songů", "#42f492", ""));

            } else {
                server.queue.push(args[0]);
                server.users.push(message.author);
            }

            title = info.title;


            if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function (connection) {
                play(client, connection, message);
            })

            message.channel.send(client.createEmbed(":arrow_right: ```" + title + "``` ", "0x00AE86", ""));


        })






        //if (message.channel.permissionsFor(client.user).hasPermission("MANAGE_MESSAGES"))
        // message.delete(250);


    } else {
        // name inserted
        var server = servers[message.guild.id];

        var opts = {
            maxResults: 1,
            key: 'xxx',
            type: 'video,playlist'
        };

        let searchArgs = args.join(" ");

        if (!/\S/.test(searchArgs)) {
            message.channel.send(":warning: **Prosim zadej nejaky song**");
            return;
        }

        let searchurl;


        await search(searchArgs, opts, async (err, results) => {
            if (err) {
                console.log(err);
                client.consoleError("Hudba", err);
                message.channel.send(client.createEmbed(":x: Chyba", "#ff0000", "Nastala chyba ve hledání písničky."));
                return;
            }
            try {
                searchurl = results[0].link;

            }
            catch (err) {
                return message.channel.send(client.createEmbed(":x: Písnička nebyla nalezena.", "#f44242", ""));
            }

            if (results[0].kind == "youtube#playlist") {

                var itemCount = 0;
                await ypi("AIzaSyBcgktJJPpzcqfeKEqZV43leskdt0GYvlU", results[0].id).then(items => {
                    items.forEach(function (item) {
                        itemCount++;
                        server.queue.push("https://www.youtube.com/watch?v=" + item.resourceId.videoId);
                        server.users.push(message.author);
                    })
                }).catch(console.error);
                message.channel.send(client.createEmbed(":white_check_mark: Přidáno " + itemCount + " songů", "#42f492", ""));

            } else {
                server.queue.push(searchurl);
                server.users.push(message.author);
            }


            var title = results[0].title;
            message.channel.send(client.createEmbed(":arrow_right: ```" + title + "``` ", "0x00AE86", ""));


            if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function (connection) {
                play(client, connection, message);
            })



        })
    }

}

exports.conf = {
    enabled: true,
    aliases: ["play", "hraj", "hrát"],
};

exports.help = {
    name: "hrat",
    category: "Hudba",
    description: "Zahraj hudbu",
    usage: "hrat [URL/vyhledávání]"
};
