
// Daily bonus command
const Discord = require('discord.js');
const config = require('../config.json');

var moment = require('moment');
moment().format();


exports.run = async (client, message, args) => {

    let rewardMoney = 2500;

    var thisMoney;

    var query = "SELECT money, lastTimeClaimed FROM money WHERE id = " + message.author.id;
    client.mysql.query(query, async function (err, result) {
        thisMoney = result[0];

        if (!thisMoney) await client.initUserDB(message.author); // Pokud uživatel není v databázi, přidat ho do ní


        if (thisMoney.lastTimeClaimed !== moment().format('l')) {
            var setMoneyQuery = `UPDATE money SET money = ${thisMoney.money + rewardMoney}, lastTimeClaimed = '${moment().format('l')}' WHERE id = '${message.author.id}'`;
            client.mysql.query(setMoneyQuery, function (err, result) {
                if (err) throw err;
                message.channel.send(client.createEmbed(":money_with_wings: Vyzvednul sis denní bonus a získal jsi: ", "#89f441", rewardMoney + " Kč"));
            });
        } else {
            message.channel.send(client.createEmbed(":x: Již sis využil svůj denní bonus!", "#f47041", ""));
        }

    });
}

exports.conf = {
    enabled: true,
    aliases: ["daily", "denníbonus"],
};

exports.help = {
    name: "dailybonus",
    category: "Ekonomika",
    description: "Získej denní bonus!",
    usage: "daily"
};