const connection = require('../database/mariadb');
const promiseConn = connection.promise();

/**
 * @param {number} followerId
 * @param {number} followingId
 * @returns {Promise<number>}
 */
async function insertFollow(followerId, followingId) {
    const [result] = await promiseConn.query(
        'INSERT IGNORE INTO follows(followerId, followingId) VALUES(?, ?)',
        [followerId, followingId]
    );

    return result.affectedRows;
}

/**
 * @param {number} followerId
 * @param {number} followingId
 * @returns {Promise<number>}
 */
async function deleteFollow(followerId, followingId) {
    const [result] = await promiseConn.query(
        'DELETE FROM follows WHERE followerId = ? AND followingId = ?',
        [followerId, followingId]
    );

    return result.affectedRows;
}

/**
 * @param {number} followerId
 * @param {number} followingId
 * @returns {Promise<number>}
 */
async function isFollow(followerId, followingId) {
    const [rows] = await promiseConn.query( // sql 재작성하기
        'SELECT 1 FROM follows WHERE followerId = ? AND followingId = ?',
        [followerId, followingId]
    );

    return rows.length;
}

module.exports.insertFollow = insertFollow;
module.exports.deleteFollow = deleteFollow;
module.exports.isFollow = isFollow;
