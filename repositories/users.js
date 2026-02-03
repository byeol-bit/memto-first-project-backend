const pool = require('../database/mariadb');

/**
 * @param {string} nickname 
 * @param {string} introduction 
 * @param {string} category 
 * @returns {Promise<number>}
 */
async function insertUser(nickname, introduction, category, password) {
    const [result] = await pool.query(
        'INSERT INTO users(nickname, introduction, category, password) VALUES(?, ?, ?, ?)',
        [nickname, introduction, category, password]
    );

    return result.insertId;
}

/**
 * @returns {Promise<User[]>}
 */
async function findUsers() {
    const [results] = await pool.query('SELECT * FROM users');
    return results;
}


/**
 * @param {number} id 
 * @returns {Promise<User[]>}
 */
async function findUserById(id) {
    const [results] = await pool.query('SELECT * FROM users WHERE id = ?', id);
    return results;
}

/**
 * @param {string | null | undefined} nickname 
 * @param {string | null | undefined} category 
 * @returns {Promise<User[]>}
 */
async function searchUsers(nickname, category) {
    let sql = 'SELECT * FROM users WHERE 1=1';
    let values = [];

    if (nickname) {
        sql += ' AND nickname LIKE ?';
        values.push(`%${nickname}%`);
    }
    if (category) {
        sql += ' AND category = ?';
        values.push(category);
    }

    let [results] = await pool.query(sql, values);
    return results;
}

/**
 * @param {number} id 
 * @param {string} filename 
 * @param {Date} date 
 * @returns {Promise<number>}
 */
async function updateProfileImageById(id, filename, date) {
    const [result] = await pool.query(
        'UPDATE users SET profileImage = ?, profileImageUpdatedAt = ? WHERE id = ?',
        [filename, date, id]
    );

    return result.affectedRows;
}

/**
 * @param {number} id 
 * @returns {Promise<{profileImage: string, profileImageUpdatedAt: Date}>}
 */
async function getProfileImageInfoById(id) {
    const [rows] = await pool.query(
        'SELECT profileImage, profileImageUpdatedAt FROM users WHERE id = ?',
        [id]
    );

    return rows[0];
}

module.exports.insertUser = insertUser;
module.exports.findUsers = findUsers;
module.exports.findUserById = findUserById;
module.exports.searchUsers = searchUsers;
module.exports.updateProfileImageById = updateProfileImageById;
module.exports.getProfileImageInfoById = getProfileImageInfoById;