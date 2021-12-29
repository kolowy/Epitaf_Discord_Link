const axios = require('axios');
const { MessageEmbed } = require('discord.js');
const configEmbed = require('../config/embed.json')
const APIKEY = process.env.TOKEN
const header = { headers: { 'Authorization': 'Bearer ' + APIKEY } }
var TheDay = new Date();
var TheNewDay = TheDay.toISOString().substring(0, 10)
var TheNextDay = new Date() // Tommorow
TheNextDay.setDate(TheNextDay.getDate()+1)
var TheNextDay = TheNextDay.toISOString().substring(0,10)
console.log(TheNextDay)
let token = apiToToken()
let headers = { headers: { 'Authorization': 'Bearer ' + token } }


//change the Api key to JTW token (token)
async function apiToToken() {
    axios.post('https://api.epitaf.fr/v1/users/callback', " ", header)
        .then(function(response) {
            token = response.data.token;
            console.log (token)
            headers = { headers: { 'Authorization': 'Bearer ' + token } }
            return response.data.token;
        })
    .catch(function(error) {
        console.log(error)
    });
}
console.log (token)



//regrouping all the configs for the embeds in a dict
const dictTask = new Map();
dictTask.set('algorithmics',configEmbed.algorithmics).set('english',configEmbed.english)
    .set('architecture',configEmbed.architecture).set('other',configEmbed.other)
    .set('electronics',configEmbed.electronics).set('mathematics',configEmbed.mathematics)
    .set('physics',configEmbed.physics).set('programming',configEmbed.programming)
    .set('project',configEmbed.project).set('te',configEmbed.te);


//regrouping all the configs for the embeds in a dict
const dictCalendar = new Map();
dictCalendar.set('Algorithmique',configEmbed.algorithmics).set('Anglais',configEmbed.english).set('Anglais CIE',configEmbed.english).set('Anglais TIM', configEmbed.english)
    .set('Architecture',configEmbed.architecture).set('Autre',configEmbed.other)
    .set('Électroniques',configEmbed.electronics).set('Mathématiques',configEmbed.mathematics)
    .set('Physique',configEmbed.physics).set('Programmation',configEmbed.programming)
    .set('Projet',configEmbed.project).set('TE',configEmbed.te).set('Soutien', configEmbed.soutien).set('Contrôles',configEmbed.exam)




async function tasks(guild) {
  await axios.get('https://api.epitaf.fr/v1/tasks', headers)
    .then(function(response) {
        let taskEmbeds = []
        let config = ''
        console.log(response.data.length)
        for (let i = 0; i < response.data.length; i++) {
            config = dictTask.get(response.data[i].subject);
            //Checking for what day is the work
            
            if (response.data[i].due_date.substring(0, 10)!=TheNewDay && response.data[i].due_date.substring(0, 10) == TheNextDay){//If the work isn't for today : add$
              console.log(response.data[i].due_date.substring(0, 10)) 
              const task = new MessageEmbed()
              .setColor(config.color)
              .setThumbnail(config.header_icon)
              .setAuthor(config.name)
              .addField(response.data[i].title, response.data[i].content, false)
              .setFooter("Work for " + response.data[i].due_date.substring(8, 10)+ response.data[i].due_date.substring(4, 8)+ response.data[i].due_date.substring(0, 4))//Putting the date in the French format
              taskEmbeds.push(task)
            } else {
                //pass because no need to this today's work
            }
        }
        if (taskEmbeds.length > 0) {
          guild.send({ embeds: taskEmbeds })
        } else {
          const nothEmbed = new MessageEmbed()
            .setColor('#FF2E00')
            .setAuthor('There is no tasks for tommorow')
          guild.send({embeds : [nothEmbed]})
        }
        
    })
    .catch(function(error) {
        console.log(error)
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
        config = dictCalendar.get(sortCalendar[i].name.split(" ", 1)[0])
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

          if (config.name=="Exam"){
            event.setColor(config.color)
              .setAuthor(config.name)
              .setThumbnail(config.header_icon)
              .addFields(
                {name:"Beggining of class",value:startHour},
                {name:"End of class",value:endHour},
                {name:'Room(s)',value:"Check your rooms in your mails"}
            )
          } else{
              const event = new MessageEmbed()
              .setColor(config.color)
              .setAuthor(config.name)
              .setThumbnail(config.header_icon)
              .addFields(
                {name:"Beggining of class",value:startHour},
                {name:"End of class",value:endHour},
                {name:'Room(s)',value:sortCalendar[i].rooms[0].name}
                )
          }
          calendarEmbeds.push(event) 
      } 
    }

    if (calendarEmbeds.length==0){
      const nothEmbed = new MessageEmbed()
        .setColor('#FF2E00')
        .setAuthor('There is no class for tommorow')
      guild.send({embeds : [nothEmbed]})
    }else{
      guild.send({embeds : calendarEmbeds})
    }});
}

async function endTime(){
    var cron
    await axios.get('https://api.epitaf.fr/v1/users/calendar', headers).then(function(response) {
        var sortCalendar = []
        let endHour = ''

        for (let i = 0; i < response.data.length; i++){
            if (response.data[i].startDate.substring(0,10)==TheNextDay){
                sortCalendar.push(response.data[i])
           }
        }
        sortCalendar.sort((a, b) => a.startDate.substring(11,13) - b.startDate.substring(11,13));

        for (let i = 0; i < sortCalendar.length; i++){

            if (sortCalendar[i].startDate.substring(0,10)==TheNextDay){

                endHour = sortCalendar[i].endDate.substring(11,19)
                endHourTemp = (parseInt(endHour.substring(0,2))+2)
                if(endHourTemp<10){
                endHourTemp = "0" + endHourTemp.toString()
                }else{
                endHourTemp.toString()
                }

                endHour = endHourTemp + sortCalendar[i].endDate.substring(13,19)

                heure = parseInt(endHour.substring(0,2))
                minutes = parseInt(endHour.substring(3,5))

                minutes += 30
                if (minutes>60){
                  minutes = minutes[60]
                  heure += 1
                }

                cron = minutes.toString() + ' ' + heure.toString() + ' * * *'
            } 
        }
        
    })
    return cron

}


module.exports = {
    tasks,
    calendar,
    endTime,
    apiToToken
}