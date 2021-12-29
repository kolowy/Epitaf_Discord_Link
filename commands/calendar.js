const { calendar } = require('../requests/tasks')

exports.run = (client, message) => {
    calendar(message.channel).catch(console.error);
}