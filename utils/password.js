const bcrypt = require('bcryptjs');

/**
 * @param {string} password 
 * @returns {Promise<string>}
 */
async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

/**
 * @param {string} password 
 * @param {string} hashed
 * @returns {Promise<string>}
 */
async function compare(password, hashed) {
    return await bcrypt.compare(password, hashed);
}

module.exports.hashPassword = hashPassword;
module.exports.compare = compare;