const pool = require('../database/mariadb');

/**
 * @param {number} followerId
 * @param {number} followingId
 * @returns {Promise<number>}
 */
async function insertFollow(followerId, followingId) {
    const [result] = await pool.query(
        'INSERT IGNORE INTO follows(follower_id, following_id) VALUES(?, ?)',
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
    const [result] = await pool.query(
        'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
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
    const [rows] = await pool.query( // sql 재작성하기
        'SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?',
        [followerId, followingId]
    );

    return rows.length;
}

module.exports.insertFollow = insertFollow;
module.exports.deleteFollow = deleteFollow;
module.exports.isFollow = isFollow;
