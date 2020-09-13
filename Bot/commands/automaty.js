
// Automaty command
const Discord = require('discord.js');
const config = require('../config.json');

function countInArray(array, what) {
    var count = 0;
    for (var i = 0; i < array.length; i++) {
        if (array[i] === what) {
            count++;
        }
    }
    return count;
}


exports.run = async (client, message, args) => {

    return message.channel.send(client.createEmbed(":x: Chyba", "#ff0000", "Tento příkaz se právě předělává.."));

    var moneyQuery = "SELECT money FROM money WHERE id = " + message.author.id;
    client.mysql.query(moneyQuery, async function (err, result) {
        if (err) throw err;
        console.log(result);
        var money = 0;
        if (!result[0]) {
            await client.initUserDB(message.author);
        } else {
            money = result[0].money;
        }

        if (money < args[0]) return message.channel.send(client.createEmbed(":x: Nemáš dostatek peněz!", "#f44141", ""));
        if (!args[0] || args[0] < 0 || isNaN(args[0])) return message.channel.send(client.createEmbed(":x: Toto číslo není validní.", "#f44242", ""));

        money -= Number(args[0]); // Odebrání vsazených peněz

        let symbols = [":trophy:", ":cherries:", ":watermelon:", ":lemon:", ":grapes:", ":doughnut:"];

        let results = [];
        for (i = 0; i < 3; i++) {
            results.push(symbols[Math.floor(Math.random() * symbols.length)])
        }

        let depositedMoney = args[0];
        let moneyReward = 0;


        switch (results.join(' ')) {
            case ':trophy: :trophy: :trophy:': // Jackpot
                moneyReward = depositedMoney * 100;
                break;

            case ':cherries: :cherries: :cherries:':
            case ':watermelon: :watermelon: :watermelon:':
            case ':lemon: :lemon: :lemon:':
            case ':doughnut: :doughnut: :doughnut:':
            case ':grapes: :grapes: :grapes:': // Všechny tři jakéhokoliv druhu
                moneyReward = depositedMoney * 40;
                break;

            default: // Jestli ani jedno z tohoto nebude


                if (countInArray(results, ":trophy:") == 2)
                    moneyReward = depositedMoney * 7; // Jestli dva od poháru

                if (countInArray(results, ":cherries:") == 2 || countInArray(results, ":watermelon:") == 2 || countInArray(results, ":lemon:") == 2 || countInArray(results, ":grapes:") == 2 || countInArray(results, ":doughnut:") == 2)
                    moneyReward = depositedMoney * 3; // Jestli dva od stejného druhu


                break;
        }

        money += moneyReward; // Uložení peněz do peněženky

        var saveQuery = `UPDATE money SET money = ${money} WHERE id = ${message.author.id}`;
        client.mysql.query(saveQuery, function (err, result) {
            if (err) throw err;
        });

        let embed = new Discord.RichEmbed()
            .setTitle(":slot_machine: Herní automaty")
            .setAuthor(message.author.username)
            .setDescription("[" + results[0] + "|" + results[1] + "|" + results[2] + "]" + "    Vyhrál jsi " + moneyReward + " Kč")
            .setColor("#42b9f4")
        message.channel.send({ embed });

    })

}

exports.conf = {
    enabled: true,
    aliases: ["slots", "automat", "sloty"],
};

exports.help = {
    name: "automaty",
    category: "Ekonomika",
    description: "Otestuj své štěstí a vyhraj!",
    usage: "automaty [sázka]"
};