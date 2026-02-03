const fs = require('fs').promises;
const path = require('path');
const userRepository = require('../repositories/users');
const dateUtil =  require('../utils/date');

const CATEGORIES = ['푸드파이터', '먹방유튜버', '동네맛집고수'];

/**
 * @param {{nickname: string, introduction: string, category: string}} createUserInput
 * @param {(err: Error | null, id: number) => void} callback 
 */
function createUsers(createUserInput, callback) {
    const {nickname, introduction, category} = createUserInput ?? {};

    if (
        typeof nickname !== 'string' ||
        typeof introduction !== 'string' ||
        typeof category !== 'string' ||
        !CATEGORIES.includes(category)
    ) {
        let err = new Error('mismatched types or category');
        err.statusCode = 400;
        callback(err, null);
    } else {
        userRepository.insertUser(nickname, introduction, category, (err, results) => {
            if (err) {
                err.statusCode = 500;
                console.log(err);
                callback(err, null);
            } else {
                callback(null, results.insertId);
            }
        });
    }
}

/**
 * @param {(err: Error | null, results: User[]) => void} callback 
 */
function getUsers(callback) {
    userRepository.findUsers((err, results) => {
        if (err) {
            err.statusCode = 500;
            console.log(err);
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

/**
 * @param {number} id 
 * @param {(err: Error | null, results: User) => void} callback 
 */
function getUserById(id, callback) {
    id = parseInt(id);
    if (Number.isNaN(id)) {
        let err = new Error('invaild id value');
        err.statusCode = 400;
        callback(err, null);
    } else {
        userRepository.findUserById(id, (err, results) => {
            if (err) {
                err.statusCode = 500;
                console.log(err);
                callback(err, null);
            } else if (results.length === 0) {
                let error = new Error('empty results');
                error.statusCode = 404;
                callback(error, null);
            } else {
                callback(null, results[0]);
            }
        })
    }
}

/**
 * @param {{nickname: string, category: string}} filters
 * @param {(err: Error | null, results: User[]) => void} callback
 */
function searchUsers(filters, callback) {
    let {nickname, category} = filters ?? {};
    if (
        nickname != null && typeof nickname != 'string' ||
        category != null && typeof category != 'string'
    ) {
        let err = new Error('mismatched types');
        err.statusCode = 400;
        callback(err, null);
    } else {
        userRepository.searchUsers(nickname, category, (err, results) => {
            if (err) {
                err.statusCode = 500;
                console.log(err);
                callback(err, null);
            } else {
                callback(null, results);
            }
        })
    }
}

const IMAGE_EXT = ['jpeg', 'png', 'gif', 'webp'];

// 프로필 이미지를 업로드
/**
 * 
 * @param {number} id
 * @param {Express.Multer.File} file
 * @returns {Promise<Error | {statusCode: number}>}
 */
async function uploadProfileImage(id, file) {
    if (!file) {
        let err = new Error('file not found');
        err.statusCode = 400;
        return err;
    };

    if (Number.isNaN(id)) {
        let err = new Error('invaild id value');
        err.statusCode = 400;
        return err;
    }

    let ext = file.originalname.split('.').at(-1);
    if (!IMAGE_EXT.includes(ext) || !file.mimetype.startsWith('image')) {
        let err = new Error(`mismatched file type. only allowed ${IMAGE_EXT}`);
        err.statusCode = 400;
        return err;
    }

    let now = new Date();
    let date = dateUtil.formatDate(now);

    let path = `images/users/${date}`;
    let filename = `${id}.${ext}`;

    await fs.mkdir(path, { recursive: true });
    await fs.rename(`${file.path}`, `${path}/${filename}`);

    let affectedRows = await userRepository.updateProfileImageById(id, filename, now);
    if (affectedRows === 0) {
        let err = new Error('update fail');
        err.statusCode = 400;
        return err;
    } else {
        return {
            statusCode: 201
        }
    }
}

/**
 * @param {number} id
 * @returns {Promise<string>}
 */
async function getProfileImagePath(id) {
    if (Number.isNaN(id)) {
        let err = new Error('invaild id value');
        err.statusCode = 400;
        return err;
    }

    const result = await userRepository.getProfileImageInfoById(id);
    const date = dateUtil.formatDate(result.profileImageUpdatedAt);
    let filepath = `/images/users/${date}/${result.profileImage}`;
    filepath = path.join(__dirname, '..', filepath);

    return filepath;
}

module.exports.createUsers = createUsers;
module.exports.getUsers = getUsers;
module.exports.getUserById = getUserById;
module.exports.searchUsers = searchUsers;
module.exports.uploadProfileImage = uploadProfileImage;
module.exports.getProfileImagePath = getProfileImagePath;
