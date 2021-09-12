const axios = require('axios');

const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const Discord = require("discord.js");
const configEmbed = require('../config/embed.json')
const token = process.env.TOKEN
const headers = {
    headers: { 'Authorization': 'Bearer ' + token }
}



var TheDay = new Date();
var TheNewDay = TheDay.toISOString().substring(0, 10)
var TheNextDay = new Date() // Tommorow
TheNextDay.setDate(TheNextDay.getDate()+1)
var TheNextDay = TheNextDay.toISOString().substring(0,10)

const dictTask = new Map();//regrouping all the configs for the embeds in a dict
dictTask.set('algorithmics',configEmbed.algorithmics).set('english',configEmbed.english)
    .set('architecture',configEmbed.architecture).set('other',configEmbed.other)
    .set('electronics',configEmbed.electronics).set('mathematics',configEmbed.mathematics)
    .set('physics',configEmbed.physics).set('programming',configEmbed.programming)
    .set('project',configEmbed.project).set('te',configEmbed.te);


const dictCalendar = new Map();//regrouping all the configs for the embeds in a dict
dictCalendar.set('Algorithmique',configEmbed.algorithmics).set('Anglais',configEmbed.english)
    .set('Architecture',configEmbed.architecture).set('Autre',configEmbed.other)
    .set('Électroniques',configEmbed.electronics).set('Mathématiques',configEmbed.mathematics)
    .set('Physique',configEmbed.physics).set('Programmation',configEmbed.programming)
    .set('Projet',configEmbed.project).set('TE',configEmbed.te);


async function tasks(guild) {
  await axios.get('https://api.epitaf.fr/v1/tasks', headers)
    .then(function(response) {
        let taskEmbeds = []
        let config = ''
        for (let i = 0; i < response.data.length; i++) {
            const element = response.data[i];
            config = dictTask.get(response.data[i].subject);
            //Checking for what day is the work
            if (response.data[i].due_date.substring(0, 10)!=TheNewDay){//If the work isn't for today : add
              const task = new MessageEmbed()
              .setColor(config.color)
              .setThumbnail(config.header_icon)
              .setAuthor(config.name)
              .addField(response.data[i].title, response.data[i].content, false)
              .setFooter("Work for " + response.data[i].due_date.substring(8, 10)+ response.data[i].due_date.substring(4, 8)+ response.data[i].due_date.substring(0, 4))//Putting the date in the French format
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
  await axios.get('https://api.epitaf.fr/v1/users/calendar', headers).then(function(response) {
    var calendarEmbeds = []
    let config = ''
    var sortCalendar = []

    let endHour = ''

    for (let i = 0; i < response.data.length; i++){
      if (response.data[i].startDate.substring(0,10)==TheNextDay){
          sortCalendar.push(response.data[i])
      }
    }
    sortCalendar.sort((a, b) => a.startDate.substring(11,13) - b.startDate.substring(11,13));

    for (let i = 0; i < sortCalendar.length; i++){
      config = dictCalendar.get(sortCalendar[i].name)
      if (sortCalendar[i].startDate.substring(0,10)==TheNextDay){

        //On passe au bon horaire
        startHour = sortCalendar[i].startDate.substring(11,19)
        
        startHourTemp = (parseInt(startHour.substring(0,2))+2)
        if(startHourTemp<10){
          startHourTemp = "0" + startHourTemp.toString()
        }else{
          startHourTemp.toString()
        }

        endHour = sortCalendar[i].endDate.substring(11,19)
        endHourTemp = (parseInt(endHour.substring(0,2))+2)
        if(endHourTemp<10){
          endHourTemp = "0" + endHourTemp.toString()
        }else{
          endHourTemp.toString()
        }

        endHour = endHourTemp + sortCalendar[i].endDate.substring(13,19)
        startHour = startHourTemp + sortCalendar[i].startDate.substring(13,19)
        //=======================================================//

        const event = new MessageEmbed()
         .setColor(config.color)
         .setAuthor(config.name)
         .setThumbnail(config.header_icon)
         .addFields(
           {name:"Beggining of class",value:startHour},
           {name:"End of class",value:endHour},
           {name:'Room(s)',value:sortCalendar[i].rooms[0].name}
          )

        calendarEmbeds.push(event) 
      } 
    }

    if (calendarEmbeds.length==0){
      const nothEmbed = new MessageEmbed()
        .setColor('#FF2E00')
        .setAuthor('There is nothing for tommorow')
      guild.send({embeds : [nothEmbed]})
    }else{
      guild.send({embeds : calendarEmbeds})
    }
      
  });
}

module.exports = {
    tasks,
    calendar
}