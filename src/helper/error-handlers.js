module.exports = (error) => {
    const { message } = error;
    let value;
    let status = 500;

    if(message.includes('Super Authorized access')){
        value = 'You do not have permission to perform this action'
        status = 403
    }else if(message.includes('not found')) {
        value = 'Resource not found';
        status = 404;
    }else if(message.includes('invalid role')) {
        value = 'You do not have the permission to access this route'
        status = 403
    }else{
        value = message || 'Something went wrong';
    }

    return {
        message: value,
        status
    }
}
