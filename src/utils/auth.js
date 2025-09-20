const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

async function hashPassword(plainPassword) {
    if (!plainPassword) throw new Error('Password is required');
    return await bcrypt.hash(plainPassword, SALT_ROUNDS);
}


async function comparePasswords(plainPassword, hashedPassword) {
    if (!plainPassword || !hashedPassword) return false;
    return await bcrypt.compare(plainPassword, hashedPassword);
}


function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


function isStrongPassword(password) {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/.test(password);
}

module.exports = {
    hashPassword,
    comparePasswords,
    isValidEmail,
    isStrongPassword,
};
