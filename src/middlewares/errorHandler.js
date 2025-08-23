const {NODE_ENV} = require("../config/env")


const errorHandler = (err, req, res, next) => {
    if(NODE_ENV === 'development') {
        console.error(err.stack);
    } 
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message,
    });
};



module.exports = errorHandler;