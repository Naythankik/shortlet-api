const cloudinary = require('../../config/coudinary');
const slug = require('slugify')

const uploadImage = async (filename, uploadName) => {
    let response;
    try {
        response = await cloudinary.uploader.upload(filename, {
            public_id: `${slug(uploadName)}-${Date.now()}`,
            resource_type: 'image',
            folder: 'pages',
        });
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        throw error;
    }

    return response.secure_url;
};

module.exports = {
    uploadImage,
};
