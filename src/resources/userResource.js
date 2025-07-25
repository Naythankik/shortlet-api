const userResource = (user) => {
    return {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        telephone: user.telephone,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        status: user.status,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt ?? null,
        updatedAt: user.updatedAt ?? null
    }
}

module.exports = (users) => {
    if(users){
        return users.length > 0 ? users.map(user => userResource(user)) : userResource(users)
    }else{
        return users;
    }
};
