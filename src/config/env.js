const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT || 3000,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
    RESET_TOKEN_EXPIRES_IN: process.env.RESET_TOKEN_EXPIRES_IN,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    FRONTEND_URL: process.env.FRONTEND_URL,
    PLATFORM_COMMISSION_RATE: parseFloat(process.env.PLATFORM_COMMISSION_RATE),
    DISPUTE_PENALTY_RATE: parseFloat(process.env.DISPUTE_PENALTY_RATE)
};

