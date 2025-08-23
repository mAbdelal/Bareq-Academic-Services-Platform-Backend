const jwt = require('jsonwebtoken');
const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN } = require('../config/env');

function signAccessToken(payload, options = {}) {
    return jwt.sign(payload, JWT_ACCESS_SECRET, {
        expiresIn: JWT_ACCESS_EXPIRES_IN || '15m',
        ...options,
    });
}

function signRefreshToken(payload, options = {}) {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN || '7d',
        ...options,
    });
}

function verifyAccessToken(token) {
    try {
        return jwt.verify(token, JWT_ACCESS_SECRET);
    } catch (err) {
        throw new Error('Invalid access token');
    }
}

function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (err) {
        throw new Error('Invalid refresh token');
    }
}

module.exports = {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
};
