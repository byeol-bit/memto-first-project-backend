const fs = require('fs').promises;
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const passwordUtil = require('../utils/password');
const userRepository = require('../repositories/users');

const CATEGORIES = ['푸드파이터', '먹방유튜버', '동네맛집고수'];
const IMAGE_EXT = ['jpeg', 'png', 'gif', 'webp'];

/**
 * @param {User[]} users
 * @returns {User[]}
 */
function convertUsersToCamelCase(users) {
    for(let i = 0; i < users.length; i++) {
        users[i] = convertUserToCamelCase(users[i]);
    }
    return users;
}

function convertUserToCamelCase(user) {
    const {id, login_id, nickname, introduction, category, created_at} = user;
    return {
        id,
        loginId: login_id,
        nickname,
        introduction,
        category,
        createdAt: created_at
    };
}

/**
 * @param {number} page
 * @param {number} limit
 * @returns {number}
 */
function getPageStart(page, limit) {
    return (page - 1) * limit;
}

/**
 * @param {{loginId: string, nickname: string, introduction: string, password: string}} createUserInput
 * @param {Express.Multer.File | undefined} file
 * @returns {Promise<Error | null>}
 */
async function createUsers(createUserInput, file) {
    const {loginId, nickname, introduction, password} = createUserInput ?? {};

    if (
        typeof loginId !== 'string' ||
        typeof nickname !== 'string' ||
        typeof introduction !== 'string' ||
        typeof password !== 'string'
    ) {
        let err = new Error('입력값이 비어있거나, 타입이 올바르지 않습니다.');
        err.statusCode = 400;
        return err;
    } else {
        const hashedPassword = await passwordUtil.hashPassword(password);
        let category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]; // 카테고리 다양성을 위한 임시 코드
        let insertId = await userRepository.insertUser(loginId, nickname, introduction, category, hashedPassword);
        if (insertId) {
            if (!file) return insertId;

            let result = await uploadProfileImage(insertId, file);
            if (result instanceof Error) {
                return result;
            } else {
                return insertId;
            }
        } else {
            let err = new Error('이 유저를 추가할 수 없습니다.');
            err.statusCode = 400;
            return err;
        }
    }
}

/**
 * @param {string} loginId 
 * @param {string} password 
 * @returns {Promise<{ token: string, id: number, nickname: string } | Error>}
 */
async function login(loginId, password) {
    if (
        typeof loginId != 'string' ||
        typeof password != 'string'
    ) {
        let err = new Error('아이디 또는 비밀번호의 타입이 올바르지 않습니다.');
        err.statusCode = 400;
        return err;
    }
    let authUser = await userRepository.findAuthUserByLoginId(loginId);
    if (authUser == null) {
        let err = new Error('닉네임 또는 비밀번호가 다릅니다.');
        err.statusCode = 400;
        return err;
    } else if (await passwordUtil.compare(password, authUser.password)) {
        let token = jwt.sign(
            {id: authUser.id},
            process.env.JWT_KEY,
            { expiresIn: '30m' }
        )
        return { token, id: authUser.id, nickname: authUser.nickname };
    } else {
        let err = new Error('닉네임 또는 비밀번호가 다릅니다.');
        err.statusCode = 400;
        return err;
    }
}

/**
 * @param {string} page 
 * @param {string} limit
 * @returns {Promise<User[]>}
 */
async function getUsers(page, limit) {
    page = parseInt(page);
    limit = parseInt(limit);
    if (Number.isNaN(page) || Number.isNaN(limit)) {
        let err = new Error('offset 또는 limit의 타입이 올바르지 않습니다.');
        err.statusCode = 400;
        return err;
    }
    const offset = getPageStart(page, limit);
    let users = await userRepository.findUsers(offset, limit);
    return convertUsersToCamelCase(users);
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
        return convertUserToCamelCase(results[0]);
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
 * @param {string} page 
 * @param {string} limit
 * @param {{nickname: string, categories: string | string[]}} filters
 * @returns {Promise<User[] | Error>}
 */
async function searchUsers(filters, page, limit) {
    let {nickname, category} = filters ?? {};
    let categories = category;
    
    if (categories == null) {
        categories = []
    } else if (!Array.isArray(categories)) {
        categories = [categories]
    }

    page = parseInt(page);
    limit = parseInt(limit);

    if (
        nickname != null && typeof nickname != 'string' ||
        !categories.every(category => typeof category == 'string') ||
        Number.isNaN(page) || Number.isNaN(limit)
    ) {
        let err = new Error('타입이 올바르지 않습니다.');
        err.statusCode = 400;
        return err;
    } else {
        const offset = getPageStart(page, limit);
        let users = await userRepository.searchUsers(nickname, categories, offset, limit);
        return convertUsersToCamelCase(users);
    }
}

/**
 * @param {string} limit
 * @returns {Promise<User[] | Error>}
 */
async function getRandomUsers(limit) {
    limit = parseInt(limit);
    if (Number.isNaN(limit)) {
        let err = new Error('');
        err.statusCode = 400;
        return err;
    }

    let users = userRepository.randomUsers(limit);
    return convertUsersToCamelCase(users);
}

/**
 * @param {string} loginId
 * @returns {Promise<boolean | Error>}
 */
async function existLoginId(loginId) {
    if (typeof loginId !== 'string') {
        let err = new Error('아이디가 문자열이 아닙니다.');
        err.statusCode = 400;
        return err;
    }
    let exist = await userRepository.existByLoginId(loginId);
    return exist;
}

/**
 * @param {string} nickname
 * @returns {Promise<boolean | Error>}
 */
async function existNickname(nickname) {
    if (typeof nickname !== 'string') {
        let err = new Error('닉네임이 문자열이 아닙니다.');
        err.statusCode = 400;
        return err;
    }
    let exist = await userRepository.existByNickname(nickname);
    return exist;
}

/**
 * @returns {string[]}
 */
function getCategories() {
    return CATEGORIES;
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

    if (file) {
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

/**
 * @param {number} id 
 * @param {string} password 
 * @param {string} newPassword 
 * @returns {Promise<null | Error>}
 */
async function updatePassword(id, password, newPassword) {
    if (Number.isNaN(id)) {
        let err = new Error('id의 타입이 올바르지 않습니다.');
        err.statusCode = 400;
        return err;
    }
    if (typeof password !== 'string' || typeof newPassword !== 'string') {
        let err = new Error('비밀번호는 문자열이어야 합니다.');
        err.statusCode = 400;
        return err;
    }

    let obj = await userRepository.findPasswordById(id);

    if (!obj) {
        let err = new Error('유효하지 않은 id입니다.');
        err.statusCode = 400;
        return err;
    }

    if (!passwordUtil.compare(password, obj.password)) {
        let err = new Error('비밀번호가 올바르지 않습니다.');
        err.statusCode = 400;
        return err;
    }

    newPassword = await passwordUtil.hashPassword(newPassword);
    let affectedRows = await userRepository.updatePassword(id, newPassword);

    if (affectedRows > 0) {
        return null;
    } else {
        let err = new Error('비밀번호를 업데이트할 수 없습니다.');
        err.statusCode = 500;
        return err;
    }
}

/**
 * @param {number} id 
 * @returns {Promise<null | Error>}
 */
async function deleteUser(id) {
    let affectedRows = await userRepository.deleteUser(id);

    if (affectedRows > 0) {
        return null;
    } else {
        let err = new Error('유저를 삭제하는 데 실패했습니다.');
        err.statusCode = 404;
        return err;
    }
}

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
module.exports.login = login;
module.exports.getUsers = getUsers;
module.exports.getUserById = getUserById;
module.exports.searchUsers = searchUsers;
module.exports.getRandomUsers = getRandomUsers;
module.exports.existLoginId = existLoginId;
module.exports.existNickname = existNickname;
module.exports.getCategories = getCategories;
module.exports.updateUser = updateUser;
module.exports.updatePassword = updatePassword;
module.exports.deleteUser = deleteUser;
module.exports.uploadProfileImage = uploadProfileImage;
module.exports.getProfileImagePath = getProfileImagePath;
