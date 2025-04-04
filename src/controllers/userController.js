const errorHandler = require("../helper/error-handlers");
const User = require("../models/user");
const userResource = require('../resources/userResource')
const {updateRequest} = require("../requests/userRequest");

const readProfile = async (req, res) => {
    const { id } = req.auth
    try{
        const user = await User.findById(id);

        return res.status(200).json({
            profile: userResource(user)
        });
    }catch(err){
        console.error(err)
        return res.status(404).json(errorHandler(err));
    }
}

const updateProfile = async (req, res) => {
    if(!Object.keys(req.body).length){
        return res.status(422).json(errorHandler({message: 'Unprocessable entity'}))
    }

    const { error, value } = updateRequest(req.body);
    const { id } = req.auth

    if(error){
        return res.status(400).json(error.map(err => errorHandler(err)));
    }

    try{
        const user = await User.findByIdAndUpdate(id, value);

        return res.status(200).json({
            user: userResource(user)
        });
    }catch(err){
        console.error(err)
        return res.status(404).json(errorHandler(err));
    }
}

module.exports = {
    read: readProfile,
    updateProfile
};
