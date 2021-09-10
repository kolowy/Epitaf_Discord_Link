const keepAlive = require('./server');
keepAlive();
const axios = require('axios');
const cron = require('cron');
const moment = require('moment')
require('dotenv').config()
const token = process.env.TOKEN
const Discord = require("discord.js");
var CronJob = require('cron').CronJob;
const client = new Discord.Client({
    intents: ["GUILDS", "GUILD_MESSAGES"]
});

const { MessageEmbed } = require('discord.js');
const { MessageActionRow, MessageButton } = require('discord.js');
require('dotenv').config()

const configEmbed = require('./embed.json')

const headers = {
    headers: { 'Authorization': 'Bearer ' + token }
}

const dictTask = new Map();//regrouping all the configs for the embeds in a dict
dictTask.set('algorithmics',configEmbed.algorithmics).set('english',configEmbed.english)
    .set('architecture',configEmbed.architecture).set('other',configEmbed.other)
    .set('electronics',configEmbed.electronics).set('mathematics',configEmbed.mathematics)
    .set('physics',configEmbed.physics).set('programming',configEmbed.programming)
    .set('project',configEmbed.project).set('te',configEmbed.te);

const dictCalendar = new Map();//regrouping all the configs for the embeds in a dict
dictCalendar.set('Algorithmique',configEmbed.algorithmics).set('english',configEmbed.english)
    .set('architecture',configEmbed.architecture).set('other',configEmbed.other)
    .set('electronics',configEmbed.electronics).set('Mathématiques',configEmbed.mathematics)
    .set('physics',configEmbed.physics).set('programming',configEmbed.programming)
    .set('project',configEmbed.project).set('te',configEmbed.te);

//Retrieving the current date
TheDay = new Date();
TheNewDay = TheDay.toISOString().substring(0, 10)
TheNextDay = new Date()
TheNextDay.setDate(TheNextDay.getDate()+1)
TheNextDay = TheNextDay.toISOString().substring(0,10)

Temp = new Date("2021-09-13")
DateTemp = Temp.toISOString().substring(0,10)

async function tasks(guild) {
  await axios.get('https://api.epitaf.fr/v1/tasks', headers)
    .then(function(response) {
      console.log(response.data)
        let taskEmbeds = []
        let config = ''
        for (let i = 0; i < response.data.length; i++) {
            const element = response.data[i];
            config = dictTask.get(element.subject);
            //Checking for what day is the work
            if (element.due_date.substring(0, 10)!=TheNewDay){//If the work isn't for today : add
              const task = new MessageEmbed()
              .setColor(config.color)
              .setThumbnail(config.header_icon)
              .setAuthor(config.name)
              .addField(element.title, element.content, false)
              .setFooter("Pour le " + element.due_date.substring(8, 10)+ element.due_date.substring(4, 8)+ element.due_date.substring(0, 4))//Putting the date in the French format
              taskEmbeds.push(task)
            }else{
                //pass because no need to this today's work
            }
        }
        guild.send({ embeds: taskEmbeds })
    })
    .catch(function(error) {
        guild.send('token invalide')
    });
}

async function calendar(guild){
  await axios.get('https://api.epitaf.fr/v1/users/calendar', headers)
    .then(function(response) {
      var calendarEmbeds = []
      let config = ''
      
      for (let i = 0; i < response.data.length; i++){
        const element = response.data[i]
        config = dictCalendar.get(element.name)

        if (element.startDate.substring(0,10)==DateTemp){
          
          //On passe au bon horaire
          hDebut = element.startDate.substring(11,19)
          hDebTemp = (parseInt(hDebut.substring(0,2))+2)
          if(hDebTemp<10){
            hDebTemp = "0" + hDebTemp.toString()
          }else{
            hDebTemp.toString()
          }

          hFin = element.endDate.substring(11,19)
          hFinTemp = (parseInt(hFin.substring(0,2))+2)
          if(hFinTemp<10){
            hFinTemp = "0" + hFinTemp.toString()
          }else{
            hFinTemp.toString()
          }

          hFin = hFinTemp + element.endDate.substring(13,19)
          hDebut = hDebTemp + element.startDate.substring(13,19)

          const event = new MessageEmbed()
          .setColor(config.color)
          .setAuthor(config.name)
          .setThumbnail(config.header_icon)
          .addFields(
            {name:"Heure de début",value:hDebut},
            {name:"Heure de fin",value:hFin},
            {name:'Salle',value:element.rooms[0].name}
            )
          calendarEmbeds.push(event)
        }

    }
    if (calendarEmbeds.length==0){
      const nothEmbed = new MessageEmbed()
        .setColor('#FF2E00')
        .addField("Nothing",'There is nothing for tommorow',false)
      guild.send({embeds : [nothEmbed]})
    }else{
      guild.send({embeds : calendarEmbeds})
    }
      
  });
}

client.on("ready", ()=>require("./events/ready.js")(client));

client.on("messageCreate", (message) => {
    if (message.content.startsWith("!task")) {
      console.log('task ask')
      tasks(message.channel)
    }else if(message.content.startsWith("!calendar")){
      console.log('calendar ask')
      calendar(message.channel)
    }
      
});

//tell the task for the nexts day, at 16h
var job = new CronJob('00 16 * * *', function() {
    var guild = client.guilds.cache.get('882913579626561566');
    if(guild && guild.channels.cache.get('882964799036747796')){
        main(guild.channels.cache.get('882964799036747796'));
    }
}, null, true, 'Europe/Paris');
job.start();

client.login(process.env.TOKEN_DISCORD);