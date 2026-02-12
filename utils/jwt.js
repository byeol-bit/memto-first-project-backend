const jwt = require('jsonwebtoken');
require('dotenv').config();



/**
 * @param {string} token 
 * @returns {{ id: number } & import('jsonwebtoken').JwtPayload | null}
 */
function decode(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        return decoded;
    } catch (_) {
        return null;
    }
}

module.exports.decode = decode;