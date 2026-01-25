const userRepository = require('../repositories/users');
/*
여기서는 뭐해야됨?
db와 연동해주는 메서드가 있을거임.
고수 등록 post /users
고수 목록 get /users
고수 상세 get /users/:id
고수 검색 get /users/search

if (err) {
    err.statusCode = 500;
    callback(err, null);
} else {
    callback(null, results.insertId);
}
*/

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

module.exports.createUsers = createUsers;
module.exports.getUsers = getUsers;
module.exports.getUserById = getUserById;
module.exports.searchUsers = searchUsers;
