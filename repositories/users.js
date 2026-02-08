const pool = require('../database/mariadb');

/**
 * @param {string} nickname 
 * @param {string} introduction 
 * @param {string} category
 * @param {string} password
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
 * @param {string} nickname
 * @returns {Promise<{id: number, password: string}[]>}
 */
async function findAuthUserByNickname(nickname) {
    const [results] = await pool.query(
        'SELECT id, password FROM users WHERE nickname = ?',
        nickname
    )
    return results[0];
}

/**
 * @returns {Promise<User[]>}
 */
async function findUsers() {
    const [results] = await pool.query('SELECT id, nickname, introduction, category, created_at FROM users');
    return results;
}


/**
 * @param {number} id 
 * @returns {Promise<User[]>}
 */
async function findUserById(id) {
    const [results] = await pool.query('SELECT id, nickname, introduction, category, created_at FROM users WHERE id = ?', id);
    return results;
}

/**
 * @param {string | null | undefined} nickname 
 * @param {string[]} categories
 * @returns {Promise<User[]>}
 */
async function searchUsers(nickname, categories) {
    let sql = 'SELECT id, nickname, introduction, category, created_at FROM users WHERE 1=1';
    let values = [];

    if (nickname) {
        sql += ' AND nickname LIKE ?';
        values.push(`%${nickname}%`);
    }
    if (categories.length) {
        sql += ' AND category IN (?)';
        values.push(categories);
    }

    let [results] = await pool.query(sql, values);
    return results;
}

/**
 * @param {string} nickname 
 * @returns {Promise<boolean>}
 */
async function existByNickname(nickname) {
    let [results] = await pool.query(
        'SELECT 1 FROM users WHERE nickname = ?',
        nickname
    );

    return results.length > 0;
}

/**
 * @param {number} id 
 * @param {{
 *     nickname?: string,
 *     profile_image?: string,
 *     introduction?: string,
 *     category?: string
 * }} updateUserInput 
 * @returns {Promise<number>}
 */
async function updateUser(id, updateUserInput) {
    let [result] = await pool.query(
        'UPDATE users SET ? WHERE id = ?',
        [updateUserInput, id]
    );

    return result.affectedRows;
}

/**
 * @param {number} id 
 * @param {string} filename 
 * @returns {Promise<number>}
 */
async function updateProfileImageById(id, filename) {
    const [result] = await pool.query(
        'UPDATE users SET profile_image = ? WHERE id = ?',
        [filename, id]
    );

    return result.affectedRows;
}

/**
 * @param {number} id 
 * @returns {Promise<{profileImage: string}>}
 */
async function getProfileImageById(id) {
    const [rows] = await pool.query(
        'SELECT profile_image FROM users WHERE id = ?',
        [id]
    );

    return rows[0];
}

module.exports.insertUser = insertUser;
module.exports.findAuthUserByNickname = findAuthUserByNickname;
module.exports.findUsers = findUsers;
module.exports.findUserById = findUserById;
module.exports.searchUsers = searchUsers;
module.exports.existByNickname = existByNickname;
module.exports.updateUser = updateUser;
module.exports.updateProfileImageById = updateProfileImageById;
module.exports.getProfileImageById = getProfileImageById;