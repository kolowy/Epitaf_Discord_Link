const axios = require('axios');
const cron = require('cron');
const moment = require('moment')
const { MessageEmbed } = require('discord.js');
const { MessageActionRow, MessageButton } = require('discord.js');
require('dotenv').config()
const token = process.env.TOKEN


const headers = {
    headers: { 'Authorization': 'Bearer ' + token }
}

const Discord = require("discord.js");
const client = new Discord.Client({
    intents: ["GUILDS", "GUILD_MESSAGES"]
});

client.on("ready", () => {
    console.log("I am ready!");
});

async function main(message) {
    await axios.get('https://api.epitaf.fr/v1/tasks', headers)
        .then(function(response) {
            for (let i = 0; i < response.data.length; i++) {
                const element = response.data[i];
                const devoir = new MessageEmbed()
                .setColor('#32a852')
                .setAuthor(matières[element.subject] ? matières[element.subject] : element.subject)
                .addField(element.title, element.content, false)
                .setFooter(element.due_date.substring(0, 10))

                const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('primary')
                        .setLabel('Primary')
                        .setStyle('PRIMARY'),
                );

                message.channel.send({ embeds: [ devoir ], components: [row]})
            }
        })
        .catch(function(error) {
            console.log(error)
        });
}


client.on("message", (message) => {
    if (message.content.startsWith("ping")) {
        main(message)
    }
});

const matières = {
    'electronics': 'Électronique',
    'mathematics': 'Mathématiques'   
}


var CronJob = require('cron').CronJob;
var job = new CronJob('00 16 * * *', function() {
    var guild = client.guilds.cache.get('882913579626561566');
    if(guild && guild.channels.cache.get('882964799036747796')){

        guild.channels.cache.get('882964799036747796').send({ embeds: [main()] });
    }
}, null, true, 'Europe/Paris');
job.start();


client.login(process.env.TOKEN_DISCORD);




