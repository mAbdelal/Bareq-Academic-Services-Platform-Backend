const { NODE_ENV, CLIENT_URL } = require('../config/env');
const cors = require("cors"); 


const corsOptions = {
    origin: NODE_ENV === 'production'
        ? CLIENT_URL
        : 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};


module.exports = cors(corsOptions);