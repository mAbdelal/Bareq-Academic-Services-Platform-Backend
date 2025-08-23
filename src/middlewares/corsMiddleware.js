const {NODE_ENV} = require('../config/env');
const cors = require("cors"); 


const corsOptions = {
    origin: NODE_ENV === 'production'
        ? process.env.CLIENT_URL
        : 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};


module.exports = cors(corsOptions);