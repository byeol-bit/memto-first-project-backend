const pool = require('../database/mariadb');

/**
 * @param {string} loginId
 * @param {string} nickname 
 * @param {string} introduction 
 * @param {string} category
 * @param {string} password
 * @returns {Promise<number>}
 */
async function insertUser(loginId, nickname, introduction, category, password) {
    const [result] = await pool.query(
        'INSERT INTO users(login_id, nickname, introduction, category, password) VALUES(?, ?, ?, ?, ?)',
        [loginId, nickname, introduction, category, password]
    );

    return result.insertId;
}

/**
 * @param {string} loginId
 * @returns {Promise<{id: number, password: string}[]>}
 */
async function findAuthUserByLoginId(loginId) {
    const [results] = await pool.query(
        'SELECT id, password FROM users WHERE login_id = ?',
        loginId
    )
    return results[0];
}

/**
 * @param {number} offset
 * @param {number} limit 
 * @returns {Promise<User[]>}
 */
async function findUsers(offset, limit) {
    const [results] = await pool.query(
        'SELECT id, login_id, nickname, introduction, category, created_at FROM users LIMIT ?, ?',
        [offset, limit]
    );
    return results;
}

/**
 * @param {number} id 
 * @returns {Promise<User[]>}
 */
async function findUserById(id) {
    const [results] = await pool.query('SELECT id, login_id, nickname, introduction, category, created_at FROM users WHERE id = ?', id);
    return results;
}

/**
 * @param {number} id 
 * @returns {Promise<{ password: string } | undefined>}
 */
async function findPasswordById(id) {
    const [results] = await pool.query('SELECT password FROM users WHERE id = ?', [id]);
    return results[0];
}

/**
 * @param {string | null | undefined} nickname 
 * @param {string[]} categories
 * @param {number} offset
 * @param {number} limit 
 * @returns {Promise<User[]>}
 */
async function searchUsers(nickname, categories, offset, limit) {
    let sql = 'SELECT id, login_id, nickname, introduction, category, created_at FROM users WHERE 1=1';
    let values = [];

    if (nickname) {
        sql += ' AND nickname LIKE ?';
        values.push(`%${nickname}%`);
    }
    if (categories.length) {
        sql += ' AND category IN (?)';
        values.push(categories);
    }
    
    sql += ' LIMIT ?, ?';
    values.push(offset, limit);

    let [results] = await pool.query(sql, values);
    return results;
}

/**
 * 
 * @param {number} limit 
 * @returns {Promise<User[]>}
 */
async function randomUsers(limit) {
    let [results] = await pool.query(
        'SELECT id, login_id, nickname, introduction, category, created_at FROM users ORDER BY RAND() LIMIT ?',
        limit
    );

    return results;
}

/**
 * @param {string} loginId 
 * @returns {Promise<boolean>}
 */
async function existByLoginId(loginId) {
    let [results] = await pool.query(
        'SELECT 1 FROM users WHERE login_id = ?',
        loginId
    );

    return results.length > 0;
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
 * @param {string} password 
 * @returns 
 */
async function updatePassword(id, password) {
    let [result] = await pool.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [password, id]
    );

    return result.affectedRows;
}

/**
 * @param {number} id 
 * @returns {Promise<number>}
 */
async function deleteUser(id) {
    let [result] = await pool.query(
        'DELETE FROM users WHERE id = ?',
        [id]
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
module.exports.findAuthUserByLoginId = findAuthUserByLoginId;
module.exports.findUsers = findUsers;
module.exports.findUserById = findUserById;
module.exports.findPasswordById = findPasswordById;
module.exports.searchUsers = searchUsers;
module.exports.randomUsers = randomUsers;
module.exports.existByLoginId = existByLoginId;
module.exports.existByNickname = existByNickname;
module.exports.updateUser = updateUser;
module.exports.updatePassword = updatePassword;
module.exports.deleteUser = deleteUser;
module.exports.updateProfileImageById = updateProfileImageById;
module.exports.getProfileImageById = getProfileImageById;