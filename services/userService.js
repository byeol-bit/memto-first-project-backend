const fs = require('fs').promises;
const path = require('path');
const passwordUtil = require('../utils/password');
const userRepository = require('../repositories/users');

const CATEGORIES = ['푸드파이터', '먹방유튜버', '동네맛집고수'];

/**
 * @param {{nickname: string, introduction: string, category: string, password: string}} createUserInput
 * @returns {Promise<Error | null>}
 */
async function createUsers(createUserInput) {
    const {nickname, introduction, category, password} = createUserInput ?? {};

    if (
        typeof nickname !== 'string' ||
        typeof introduction !== 'string' ||
        typeof category !== 'string' ||
        !CATEGORIES.includes(category) ||
        typeof password !== 'string'
    ) {
        let err = new Error('입력값이 비어있거나, 타입이 올바르지 않습니다.');
        err.statusCode = 400;
        return err;
    } else {
        const hashedPassword = await passwordUtil.hashPassword(password);
        let insertId = await userRepository.insertUser(nickname, introduction, category, hashedPassword);
        if (insertId != 0) {
            return insertId;
        } else {
            let err = new Error('이 유저를 추가할 수 없습니다.');
            err.statusCode = 400;
            return err;
        }
    }
}

/**
 * @returns {Promise<User[]>}
 */
async function getUsers() {
    let users = await userRepository.findUsers();
    return users;
}

/**
 * @param {number} id 
 * @returns {Promise<Error | User>}
 */
async function getUserById(id) {
    id = parseInt(id);
    if (Number.isNaN(id)) {
        let err = new Error('id 값이 잘못되었습니다.');
        err.statusCode = 400;
        return err;
    }

    let results = await userRepository.findUserById(id);
    if (results.length === 1) {
        return results[0];
    } else if (results.length === 0) {
        let err = new Error('해당하는 유저가 존재하지 않습니다.');
        err.statusCode = 400;
        return err;
    } else {
        let err = new Error('같은 아이디를 가진 유저가 2명 이상입니다...?');
        err.statusCode = 400;
        return err;
    }
}

/**
 * @param {{nickname: string, category: string}} filters
 * @returns {Promise<User[] | Error>}
 */
async function searchUsers(filters) {
    let {nickname, category} = filters ?? {};
    if (
        nickname != null && typeof nickname != 'string' ||
        category != null && typeof category != 'string'
    ) {
        let err = new Error('타입이 올바르지 않습니다.');
        err.statusCode = 400;
        return err;
    } else {
        const users = await userRepository.searchUsers(nickname, category);
        return users;
    }
}

/**
 * @param {string} id 
 * @param {{
 *     nickname?: string,
 *     introduction?: string,
 *     category?: string
 * }} updateUserInput
 * @param {Express.Multer.File | undefined} file
 * @returns {Promise<Error | null>}
 */
async function updateUser(id, updateUserInput, file) {
    id = parseInt(id);
    updateUserInput = updateUserInput ?? {};
    if (
        Number.isNaN(id) ||
        updateUserInput.category != null && !CATEGORIES.includes(updateUserInput.category) ||
        updateUserInput.profile_image != null
    ) {
        let err = new Error('타입이 올바르지 않습니다.');
        err.statusCode = 400;
        return err;
    }

    let newUpdateUserInput = {};

    let ext = file.originalname.split('.').at(-1);
    if (!IMAGE_EXT.includes(ext) || !file.mimetype.startsWith('image')) {
        let err = new Error(`파일 타입은 ${IMAGE_EXT}만 허용됩니다.`);
        err.statusCode = 400;
        return err;
    }

    let path = 'images/users';
    let filename = `${id}.${ext}`;

    if (file) {
        await fs.mkdir(path, { recursive: true });
        await fs.rename(`${file.path}`, `${path}/${filename}`);
        newUpdateUserInput.profile_image = filename;
    }

    for (const [key, value] of Object.entries(updateUserInput)) {
        if (value != null) {
            newUpdateUserInput[key] = value;
        }
    }

    if (Object.keys(newUpdateUserInput).length === 0 && !file) {
        let err = new Error('업데이트할 내용이 없습니다.');
        err.statusCode = 400;
        return err;
    }

    const affectedRows = await userRepository.updateUser(id, newUpdateUserInput);
    
    if (affectedRows === 0) {
        let err = new Error('업데이트에 실패했습니다.');
        err.statusCode = 500;
        return err;
    }

    return null;
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
        let err = new Error(`파일 타입은 ${IMAGE_EXT}만 허용됩니다.`);
        err.statusCode = 400;
        return err;
    }

    let path = 'images/users';
    let filename = `${id}.${ext}`;

    await fs.mkdir(path, { recursive: true });
    await fs.rename(`${file.path}`, `${path}/${filename}`);

    let affectedRows = await userRepository.updateProfileImageById(id, filename);
    if (affectedRows === 0) {
        let err = new Error('업데이트 실패');
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

    const result = await userRepository.getProfileImageById(id);
    let filepath = `/images/users/${result.profile_image}`;
    filepath = path.join(__dirname, '..', filepath);

    return filepath;
}

module.exports.createUsers = createUsers;
module.exports.getUsers = getUsers;
module.exports.getUserById = getUserById;
module.exports.searchUsers = searchUsers;
module.exports.updateUser = updateUser;
module.exports.uploadProfileImage = uploadProfileImage;
module.exports.getProfileImagePath = getProfileImagePath;
