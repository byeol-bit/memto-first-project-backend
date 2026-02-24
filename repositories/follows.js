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

/**
 * @param {number} followerId 
 * @returns {Promise<number>}
 */
async function countFollwingByFollowerId(followerId) {
    const [rows] = await pool.query(
        'SELECT COUNT(*) as count FROM follows WHERE follower_id = ?',
        followerId
    )

    return rows[0].count;
}

/**
 * @param {number} followingId 
 * @returns {Promise<number>}
 */
async function countFollowerByFollowingId(followingId) {
    const [rows] = await pool.query(
        'SELECT COUNT(*) as count FROM follows WHERE following_id = ?',
        followingId
    )

    return rows[0].count;
}

/**
 * @param {number} id
 * @param {number} offset
 * @param {number} limit 
 * @returns {Promise<{id: number, nickname: string, category: string}[]>}
 */
async function getFollowingsById(id, offset, limit) {
    const [rows] = await pool.query(`
        SELECT u.id, u.nickname, u.category, u.introduction
        FROM follows f
        JOIN users u ON u.id = f.following_id
        WHERE f.follower_id = ?
        LIMIT ?, ?
        `,
        [id, offset, limit]
    );

    return rows;
}

/**
 * @param {number} myId
 * @param {number} id
 * @param {number} offset
 * @param {number} limit 
 * @returns {Promise<{id: number, nickname: string, category: string, follow: boolean}[]>}
 */
async function getFollowingsAndFollowById(myId, id, offset, limit) {
    const [rows] = await pool.query(`
        SELECT u.id, u.nickname, u.category, u.introduction, (f2.follower_id IS NOT NULL) AS follow
        FROM follows f
        JOIN users u ON u.id = f.following_id
        LEFT JOIN follows f2 ON f2.follower_id = ? AND f2.following_id = f.following_id
        WHERE f.follower_id = ?
        LIMIT ?, ?
        `,
        [myId, id, offset, limit]
    );

    return rows;
}

/**
 * @param {number} id
 * @param {number} offset
 * @param {number} limit 
 * @returns {Promise<Array<{id: number, nickname: string, category: string}>>}
 */
async function getFollowersById(id, offset, limit) {
    const [rows] = await pool.query(`
        SELECT u.id, u.nickname, u.category, u.introduction
        FROM follows f
        JOIN users u ON u.id = f.follower_id
        WHERE f.following_id = ?
        LIMIT ?, ?
        `,
        [id, offset, limit]
    );

    return rows;
}

/**
 * @param {number} myId
 * @param {number} id
 * @param {number} offset
 * @param {number} limit 
 * @returns {Promise<Array<{id: number, nickname: string, category: string, follow: number}>>}
 */
async function getFollowersAndFollowById(myId, id, offset, limit) {
    const [rows] = await pool.query(`
        SELECT u.id, u.nickname, u.category, u.introduction, (f2.following_id IS NOT NULL) AS follow
        FROM follows f
        JOIN users u ON u.id = f.follower_id
        LEFT JOIN follows f2 ON f2.follower_id = ? AND f2.following_id = f.follower_id
        WHERE f.following_id = ?
        LIMIT ?, ?
        `,
        [myId, id, offset, limit]
    );

    return rows;
}

module.exports.insertFollow = insertFollow;
module.exports.deleteFollow = deleteFollow;
module.exports.isFollow = isFollow;
module.exports.countFollwingByFollowerId = countFollwingByFollowerId;
module.exports.countFollowerByFollowingId = countFollowerByFollowingId;
module.exports.getFollowingsById = getFollowingsById;
module.exports.getFollowingsAndFollowById = getFollowingsAndFollowById;
module.exports.getFollowersById = getFollowersById;
module.exports.getFollowersAndFollowById = getFollowersAndFollowById;