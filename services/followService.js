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
    if (
        typeof followerId != 'number' || typeof followingId != 'number' ||
        Number.isNaN(followerId) || Number.isNaN(followingId)
    ) {
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
    if (affectedRows > 0) {
        return {
            statusCode: 200
        };
    } else {
        return {
            statusCode: 409,
            message: "이미 팔로우 중이거나, 대상 유저가 존재하지 않습니다."
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

/**
 * @param {string} userId 
 * @returns {Promise<number | FollowFailure>}
 */
async function getFollowingCount(userId) {
    userId = parseInt(userId);
    if (Number.isNaN(userId)) {
        return {
            statusCode: 400,
            message: "id는 숫자여야 합니다."
        }
    }
    let count = await followsRepository.countFollwingByFollowerId(userId);
    return count;
}

/**
 * @param {string} userId 
 * @returns {Promise<number | FollowFailure>}
 */
async function getFollowerCount(userId) {
    userId = parseInt(userId);
    if (Number.isNaN(userId)) {
        return {
            statusCode: 400,
            message: "id는 숫자여야 합니다."
        }
    }
    let count = await followsRepository.countFollowerByFollowingId(userId);
    return count;
}

/**
 * @param {number} myId
 * @param {number} id
 * @returns {Promise<Error | Array<{id: number, nickname: string, category: string, follow: boolean}>>}
 */
async function getFollowings(myId, id) {
    if (Number.isNaN(myId) || Number.isNaN(id)) {
        return {
            statusCode: 400,
            message: "id는 숫자여야 합니다."
        }
    }

    let followings = await followsRepository.getFollowingsById(myId, id);

    for(let f of followings) {
        f.follow = Boolean(f.follow);
    }

    return followings;
}

/**
 * @param {number} myId
 * @param {number} id
 * @returns {Promise<Error | Array<{id: number, nickname: string, category: string, follow: boolean}>>}
 */
async function getFollowers(myId, id) {
        if (Number.isNaN(myId) || Number.isNaN(id)) {
        return {
            statusCode: 400,
            message: "id는 숫자여야 합니다."
        }
    }

    let followers = await followsRepository.getFollowersById(myId, id);

    for(let f of followers) {
        f.follow = Boolean(f.follow);
    }

    return followers;
}

module.exports.follow = follow;
module.exports.unfollow = unfollow;
module.exports.isFollow = isFollow;
module.exports.getFollowingCount = getFollowingCount;
module.exports.getFollowerCount = getFollowerCount;
module.exports.getFollowings = getFollowings;
module.exports.getFollowers = getFollowers;