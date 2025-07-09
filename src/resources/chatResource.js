const UserResource = require('./userResource');

const apartmentResource = (chat) => {
    return {
        id: chat._id,
        lastMessage: chat?.lastMessage ? {
            text: chat.lastMessage.text,
            sender: UserResource(chat.lastMessage.sender),
            updatedAt: chat.lastMessage.at,
        } : undefined,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        participants: UserResource([...chat.participants])
    }
}

module.exports = (chats) => {
    if(chats){
        return chats.length > 0
            ? chats.map(chat => apartmentResource(chat))
            : apartmentResource(chats);
    }else{
        return chats;
    }
};
