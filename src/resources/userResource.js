const userResource = (user) => {
    return {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        telephone: user.telephone,
        email: user.email,
        role: user.role,
        dateOfBirth: user.dateOfBirth,
        isVerified: user.isVerified,
        status: user.status,
        profilePicture: user.profilePicture,
        apartments: user.apartments,
        createdAt: user.createdAt ?? null,
        updatedAt: user.updatedAt ?? null
    }
}

module.exports = (users) => {
    return users.length > 1 ? users.map(user => userResource(user)) : userResource(users)
};
