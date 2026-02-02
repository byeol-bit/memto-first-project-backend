const connection = require('../database/mariadb');
const promiseConn = connection.promise();

/**
 * @param {string} nickname 
 * @param {string} introduction
 * @param {string} category
 * @param {(err: Error | null, results) => void} callback
 */
function insertUser(nickname, introduction, category, callback) {
    connection.query(
        'INSERT INTO users(nickname, introduction, category) VALUES(?, ?, ?)',
        [nickname, introduction, category],
        callback
    )
}

/**
 * @param {(err: Error | null, results: User[]) => void} callback 
 */
function findUsers(callback) {
    connection.query('SELECT * FROM users', callback);
}

/**
 * @param {(err: Error | null, results: User[]) => void} callback 
 */
function findUserById(id, callback) {
    connection.query('SELECT * FROM users WHERE id = ?', id, callback);
}

/**
 * @param {string | null | undefined} nickname 
 * @param {string | null | undefined} category 
 * @param {(err: Error | null, results: User[]) => void} callback 
 */
function searchUsers(nickname, category, callback) {
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

    connection.query(sql, values, callback);
}

/**
 * @param {number} id 
 * @param {string} filename 
 * @param {Date} date 
 * @returns {number}
 */
async function updateProfileImageById(id, filename, date) {
    const [result] = await promiseConn.query(
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
    const [rows] = await promiseConn.query(
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