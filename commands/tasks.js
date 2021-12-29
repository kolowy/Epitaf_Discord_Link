const { tasks } = require('../requests/tasks')

exports.run = (client, message) => {
    tasks(message.channel).catch(console.error);
}