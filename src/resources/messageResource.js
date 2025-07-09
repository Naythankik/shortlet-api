const UserResource = require('./userResource');
const ChatResource = require('./chatResource');

const messageResource = (message) => {
    return {
        id: message._id,
        chat: ChatResource(message.chat),
        sender: UserResource(message.sender),
        type: message.type,
        text: message.text,
        readBy: message.readBy,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
    }
}

module.exports = (messages) => {
    if(messages){
        return messages.length > 0
            ? messages.map(message => messageResource(message))
            : messageResource(messages);
    }else{
        return messages;
    }
};
