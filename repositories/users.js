const connection = require('../database/mariadb');
/*
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nickname` VARCHAR(255) NOT NULL,
    `profileImage` VARCHAR(255),
    `introduction` TEXT,
    `category` VARCHAR(100),
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

*/
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

module.exports.insertUser = insertUser;
module.exports.findUsers = findUsers;
module.exports.findUserById = findUserById;
module.exports.searchUsers = searchUsers;