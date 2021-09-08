const keepAlive = require('./server');
keepAlive();



const axios = require('axios');
const cron = require('cron');
const moment = require('moment')
const { MessageEmbed } = require('discord.js');
const { MessageActionRow, MessageButton } = require('discord.js');
require('dotenv').config()
const token = process.env.TOKEN
const configEmbed = require('./embed.json')


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
            let devoirEmbeds = []
            let config = 'teest'
            for (let i = 0; i < response.data.length; i++) {
                const element = response.data[i];
                if(element.subject == 'algorithmics'){config = configEmbed.algorithmics}
                else if(element.subject == 'english'){config = configEmbed.english}
                else if(element.subject == 'architecture'){config = configEmbed.architecture}
                else if(element.subject == 'other'){config = configEmbed.other}
                else if(element.subject == 'electronics'){config = configEmbed.electronics}
                else if(element.subject == 'mathematics'){config = configEmbed.mathematics}
                else if(element.subject == 'physics'){config = configEmbed.physics}
                else if(element.subject == 'programming'){config = configEmbed.programming}
                else if(element.subject == 'project'){config = configEmbed.project}
                else if(element.subject == 'te'){config = configEmbed.te}

                const devoir = new MessageEmbed()
                    .setColor(config.color)
                    .setThumbnail(config.header_icon)
                    .setAuthor(config.name)
                    .addField(element.title, element.content, false)
                    .setFooter(element.due_date.substring(0, 10))

                devoirEmbeds.push(devoir)
            }
            message.channel.send({ embeds: devoirEmbeds })
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




