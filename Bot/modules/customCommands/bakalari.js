const Discord = require('discord.js');

const parseString = require("xml2js").parseString;

const axios = require('axios');

const moment = require('moment');

function TypeSwitch(message, code, client) {
    switch (code.type) {

        case "rozvrh":
            ShowRozvrh(message, code, client);
            break;

        case "ukoly":
            ShowUkoly(message, code, client);
            break;

        case "suplovani":
            ShowSuplovani(message, code, client);
            break;

    }
}


async function ShowSuplovani(message, code, client) {
    var url = `https://${code.login.bakalariURL}/login.aspx?hx=${code.login.token}&pm=suplovani`;
    await axios.get(url)
        .then(async function (response) {
            parseString(response.data, function (err, xml) {
                //Ověření jestli se načetlo správné xml
                if (err === null && xml.results.result != "-1") {


                    var dny = xml.results.suplovani[0].den;

                    var embed = new Discord.RichEmbed()
                        .setTitle("Suplování");

                    if (!dny) {
                        embed.setDescription("Žádné suplování");
                        return message.channel.send({ embed });
                    }

                    dny.forEach(function (den) {
                        var suply = [];

                        den.seznam[0].supl.forEach(function (suplovani) {
                            suply.push(suplovani.text);
                        })


                        embed.addField(den.oznaceni[0], suply.join("\n"));

                        //suplovaniPush(suply);

                    });

                    message.channel.send({ embed });

                } else {
                    if (err) throw err;
                    if (xml.results.result == "-1") {
                        return message.channel.send(client.createEmbed(":x: Chyba", "#ff0000", "Zkontroluj login údaje"));
                    }
                }
            })
        })
}


async function ShowRozvrh(message, code, client) {
    var url = `https://${code.login.bakalariURL}/login.aspx?hx=${code.login.token}&pm=all`;
    await axios.get(url)
        .then(async function (response) {
            parseString(response.data, function (err, xml) {
                //Ověření jestli se načetlo správné xml
                if (err === null && xml.results.result != "-1") {


                    var day = new Date().getDay();
                    var isWeekend = (day === 6) || (day === 0);    // 6 = sobota, 0 = neděle


                    var dny = xml.results.xmlrozvrhakt[0].results[0].rozvrh[0].dny[0].den;

                    if (isWeekend) // jestli je víkend, tak tam dáme rovnou další den
                    {
                        dny = xml.results.xmlrozvrhnext[0].results[0].rozvrh[0].dny[0].den;
                    }



                    var rozvrh = {
                        Po: {
                            hodiny: [],
                            zkratky: []
                        },
                        Út: {
                            hodiny: [],
                            zkratky: []
                        },
                        St: {
                            hodiny: [],
                            zkratky: []
                        },
                        Čt: {
                            hodiny: [],
                            zkratky: []
                        },
                        Pá: {
                            hodiny: [],
                            zkratky: []
                        }
                    }

                    dny.forEach(function (den) {
                        den.hodiny[0].hod.forEach(function (hodina) {
                            if (hodina.typ == "X") return;
                            rozvrh[den.zkratka[0]].hodiny.push(hodina);
                            if (hodina.typ == "H") {
                                rozvrh[den.zkratka[0]].zkratky.push(hodina.zkrpr);
                            } else {
                                rozvrh[den.zkratka[0]].zkratky.push("**" + hodina.zkratka + "**");
                            }
                        });
                    });


                    var zakladDatum = dny[0].datum;
                    zakladDatum = zakladDatum.toString();

                    var den = zakladDatum.substring(6, 8);
                    var mesic = zakladDatum.substring(4, 6);
                    var rok = zakladDatum.substring(0, 4);

                    var datum = den + "." + mesic + "." + rok;



                    const embed = new Discord.RichEmbed()
                        .setTitle("Rozvrh")
                        .setDescription("Začátek týdne: " + datum);

                    if (dny[0] && dny[0].zkratka && rozvrh.Po.zkratky.length > 0)
                        embed.addField(dny[0].zkratka, rozvrh.Po.zkratky.join(" | "));

                    if (dny[1] && dny[1].zkratka && rozvrh.Út.zkratky.length > 0)
                        embed.addField(dny[1].zkratka, rozvrh.Út.zkratky.join(" | "));

                    if (dny[2] && dny[2].zkratka && rozvrh.St.zkratky.length > 0)
                        embed.addField(dny[2].zkratka, rozvrh.St.zkratky.join(" | "));

                    if (dny[3] && dny[3].zkratka && rozvrh.Čt.zkratky.length > 0)
                        embed.addField(dny[3].zkratka, rozvrh.Čt.zkratky.join(" | "));

                    if (dny[4] && dny[4].zkratka && rozvrh.Pá.zkratky.length > 0)
                        embed.addField(dny[4].zkratka, rozvrh.Pá.zkratky.join(" | "));

                    message.channel.send(embed);
                    





                } else {
                    if (err) throw err;
                    if (xml.results.result == "-1") {
                        return message.channel.send(client.createEmbed(":x: Chyba", "#ff0000", "Zkontroluj login údaje"));
                    }
                }
            });
        })
        .catch(function (err) {
            throw err;
        });
}

async function ShowUkoly(message, code, client) {
    var url = `https://${code.login.bakalariURL}/login.aspx?hx=${code.login.token}&pm=ukoly`;
    await axios.get(url)
        .then(function (response) {
            parseString(response.data, function (err, xml) {
                //Ověření jestli se načetlo správné xml
                if (err === null && xml.results.result != "-1") {

                    var ukolyResults = xml.results.ukoly[0].ukol;
                    var ukoly = [];

                    ukolyResults.forEach(function (ukol) {
                        if (ukol.status[0] != "aktivni") return;

                        var obj = {
                            predmet: ukol.predmet[0],
                            zkratka: ukol.zkratka[0],
                            nakdy: ukol.nakdy[0].toString(),
                            popis: ukol.popis[0]
                        }

                        ukoly.push(obj);
                    })



                    var embed = new Discord.RichEmbed()
                        .setTitle("Úkoly");

                    ukoly.forEach(function (ukol) {

                        console.log(ukol.nakdy);
                        var den = ukol.nakdy.substring(4, 6);
                        var mesic = ukol.nakdy.substring(2, 4);

                        var nakdy = den + "." + mesic;

                        if (moment(nakdy, "DD.MM").format('DD.MM') == moment().format("DD.MM")) {
                            if (moment().tz('Europe/Prague').format('HH:mm') > moment('13:00', 'HH:mm').format('HH:mm')) {
                                return;
                            }
                        }

                        ukol.popis = ukol.popis.replace(/<br\s*[\/]?>/gi, "\n");

                        embed.addField(ukol.predmet, ukol.popis + "\n**Datum odevzání: " + nakdy + "**");


                    })


                    message.channel.send({ embed });


                } else {
                    return err;
                }
            })
        })
        .catch(function (err) {
            return err;
        });
}

exports.run = async (client, message, args, cmd) => {

    var code = cmd.code;

    var tokenRefreshing = false;

    let date = new Date();
    var currMonth = (date.getMonth() + 1).toString();
    var currDate = date.getDate().toString();

    // fix jednociferného čísla
    if (currMonth.length < 2) {
        currMonth = "0" + currMonth;
    }
    if (currDate.length < 2) {
        currDate = "0" + currDate;
    }
    // ------------------------------

    console.log((date.getFullYear().toString() + currMonth + currDate));

    if (code.login.date != (date.getFullYear().toString() + currMonth + currDate)) {
        //vygenerování nového tokenu

        console.log("Generace nového tokenu..");

        tokenRefreshing = true;

        var username = code.login.login;
        var hashedPwd = code.login.password;
        var bakalariURL = code.login.bakalariURL;

        var typ = code.type;

        let url = `https://${bakalariURL}/login.aspx?gethx=${username}`;




        axios.get(url)
            .then(function (response) {
                parseString(response.data, async function (err, xml) {
                    if (err === null && xml.results.res[0] != "02") {
                        const crypto = require("crypto");
                        let hash = crypto.createHash("sha512");
                        let date = new Date();
                        let tokenText = `*login*${username}*pwd*${hashedPwd}*sgn*ANDR${date.getFullYear()}${currMonth}${currDate}`;
                        let token = hash.update(tokenText).digest("base64");
                        //Finální upravení tokenu
                        token = token.replace(/([\\/])/g, "_").replace(/([+])/g, "-");


                        var code = {
                            login: {
                                bakalariURL: bakalariURL,
                                token: token,
                                login: username,
                                password: hashedPwd,
                                date: `${date.getFullYear()}${currMonth}${currDate}`
                            },

                            type: typ
                        }


                        console.log(code.login.date);

                        var SQLQuery = `UPDATE customCommands SET code = '${JSON.stringify(code)}' WHERE guildID = '${message.guild.id}' AND commandName = '${cmd.commandName}'`;
                        client.mysql.query(SQLQuery, function (err, result) {
                            if (err) throw err;


                            client.refreshCustomCommands();

                            TypeSwitch(message, code, client);

                        });
                    } else {
                        if (err)
                            throw err;
                    }
                })

            })
            .catch(err => {
                if (err) throw err;
            });



    }


    if (tokenRefreshing) return; // Funkce se zavolá sama, když se refreshuje token
    TypeSwitch(message, code, client);




}