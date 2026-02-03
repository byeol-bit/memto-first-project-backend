const followsRepository = require('../repositories/follows');

/**
 * @typedef {Object} FollowSuccess
 * @property {number} statusCode
 */

/**
 * @typedef {Object} IsFollowSuccess
 * @property {number} statusCode
 * @property {boolean} isFollowed
 */

/**
 * @typedef {Object} FollowFailure
 * @property {number} statusCode
 * @property {string} message
 */

/**
 * @param {number} followerId
 * @param {number} followingId
 * @returns {FollowFailure}
 */
function validateFollowIds(followerId, followingId) {
    if (typeof followerId != 'number' || typeof followingId != 'number') {
        return {
            statusCode: 400,
            message: "invaild value"
        }
    }

    if (followerId === followingId) {
        return {
            statusCode: 400,
            message: "followerId and followingId must be different"
        }
    }
}

/**
 * @param {number} followerId
 * @param {number} followingId
 * @returns {Promise<FollowSuccess | FollowFailure>}
 */
async function follow(followerId, followingId) {
    const validateFailResult = validateFollowIds(followerId, followingId);
    if (validateFailResult) return validateFailResult;

    let affectedRows = await followsRepository.insertFollow(followerId, followingId);
    console.log(`follow, affectedRows: ${affectedRows}`); // 임시
    if (affectedRows > 0) {
        return {
            statusCode: 200
        };
    } else {
        return {
            statusCode: 409,
            message: "follow status already exists"
        }
    }
}

/**
 * @param {number} followerId
 * @param {number} followingId
 * @returns {Promise<FollowSuccess | FollowFailure>}
 */
async function unfollow(followerId, followingId) {
    const validateFailResult = validateFollowIds(followerId, followingId);
    if (validateFailResult) return validateFailResult;
    
    let affectedRows = await followsRepository.deleteFollow(followerId, followingId);
    if (affectedRows > 0) {
        return {
            statusCode: 200
        };
    } else {
        return {
            statusCode: 409,
            message: "follow status already not exists"
        }
    }
}

/**
 * @param {number} followerId
 * @param {number} followingId
 * @returns {Promise<IsFollowSuccess | FollowFailure>}
 */
async function isFollow(followerId, followingId) {
    const validateFailResult = validateFollowIds(followerId, followingId);
    if (validateFailResult) return validateFailResult;

    let resultRows = await followsRepository.isFollow(followerId, followingId);

    return {
        statusCode: 200,
        isFollowed: resultRows > 0
    };
}

module.exports.follow = follow;
module.exports.unfollow = unfollow;
module.exports.isFollow = isFollow;