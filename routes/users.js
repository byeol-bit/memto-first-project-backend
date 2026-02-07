const express = require('express');
const multer = require('multer');
const userService = require('../services/userService');
const catchAsync = require('../utils/catchAsync');

const router = express.Router();

const upload = multer({ dest: 'images/temp/' });

/**
 * @swagger
 * definitions:
 *   User:
 *     description: createdAt, updatedAt은 시간을 나타내는 문자열입니다.
 *     type: object
 *     properties:
 *       id:
 *         type: number
 *       nickname:
 *         type: string
 *       introduction:
 *         type: string
 *       category:
 *         type: string
 *       createdAt:
 *         type: string
*/

/**
 * @swagger
 * /users:
 *   post:
 *     tags:
 *       - users
 *     summary: 고수 등록
 *     description: 새로운 고수를 등록합니다.
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         schema:
 *           type: object
 *           required:
 *             - nickname
 *             - introduction
 *             - category
 *             - password
 *           properties:
 *             nickname:
 *               type: string
 *             introduction:
 *               type: string
 *             category:
 *               type: string
 *               enum: ['푸드파이터', '먹방유튜버', '동네맛집고수']
 *             password:
 *               type: string
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: 유저 생성 및 id 반환
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: number
 *       400:
 *         description: 잘못된 값 입력
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       500:
 *         description: 서버 오류
*/
router.post('/', catchAsync(async (req, res) => { 
    let result = await userService.createUsers(req.body);
    if (typeof result == 'number') {
        res.status(201).json({id: result});
    } else {
        res.status(result.statusCode).json({
            message: result.message
        });
    }
}));

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - users
 *     summary: 모든 고수 조회
 *     description: 등록된 모든 고수들을 반환합니다.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 모든 유저 반환
 *         schema:
 *           type: array
 *           items:
 *             $ref: "#/definitions/User"
 *       500:
 *         description: 서버 오류
*/
router.get('/', catchAsync(async (_, res) => {
    let users = await userService.getUsers();
    res.status(200).json(users);
}));

/**
 * @swagger
 * /users/search:
 *   get:
 *     tags:
 *       - users
 *     summary: 고수 검색
 *     description: 닉네임, 카테고리에 맞는 고수를 검색합니다.
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: nickname
 *         type: string
 *       - in: query
 *         name: category
 *         type: string
 *         enum: ['푸드파이터', '먹방유튜버', '동네맛집고수']
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 모든 유저 반환
 *         schema:
 *           type: array
 *           items:
 *             $ref: "#/definitions/User"
 *       500:
 *         description: 서버 오류
*/
router.get('/search', catchAsync(async (req, res) => { 
    let result = await userService.searchUsers(req.query);
    if (result instanceof Error) {
        res.status(result.statusCode).json({message: result.message});
    } else {
        res.status(200).json({users: result});
    }
}));

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags:
 *       - users
 *     summary: 고수 한명의 정보
 *     description: 해당하는 id의 고수의 정보를 가져옵니다.
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         type: number
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 유저 한 명 반환
 *         schema:
 *           $ref: "#/definitions/User"
 *       500:
 *         description: 서버 오류
*/
router.get('/:id', catchAsync(async (req, res) => {
    let result = await userService.getUserById(req.params.id);
    if (result instanceof Error) {
        res.status(result.statusCode).json({ message: result.message });
    } else {
        res.status(200).json(result);
    };
}));

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     tags:
 *       - users
 *     summary: 고수 정보 수정
 *     description: 원하는 옵션을 선택적으로 사용해 고수의 정보를 수정합니다.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         type: number
 *       - in: formData
 *         name: nickname
 *         type: string
 *       - in: formData
 *         name: introduction
 *         type: string
 *       - in: formData
 *         name: category
 *         type: string
 *       - in: formData
 *         name: image
 *         type: file
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: 잘못된 값 입력
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       500:
 *         description: 서버 오류
*/
router.put('/:id', upload.single('image'), catchAsync(async (req, res) => {
    let err = await userService.updateUser(req.params.id, req.body, req.file);
    if (err == null) {
        res.status(200).end();
    } else {
        res.status(err.statusCode).json({
            message: err.message
        });
    }
}))



/**
 * @swagger
 * /users/{id}/image:
 *   put:
 *     tags:
 *       - users
 *     summary: 프로필 이미지 등록
 *     description: 유저의 프로필 이미지를 등록합니다.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         type: number
 *       - in: formData
 *         name: image
 *         type: file
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: 이미지 업데이트 성공
 *       400:
 *         description: id 또는 파일에 문제가 있으면 반환
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       500:
 *         description: 서버 오류
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
*/
router.put('/:id/image', upload.single('image'), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const result = await userService.uploadProfileImage(id, req.file);

        if (result.statusCode == 201) {
            res.status(201).end();
        } else {
            res.status(result.statusCode).json({message: result.message});
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

/**
 * @swagger
 * /users/{id}/image:
 *   get:
 *     tags:
 *       - users
 *     summary: 프로필 이미지 획득
 *     description: 유저의 프로필 이미지를 획득합니다.
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         type: number
 *     produces:
 *       - image/jpeg
 *       - image/png
 *       - image/gif
 *       - image/webp
 *     responses:
 *       200:
 *         description: 이미지 반환
 *       400:
 *         description: id 또는 파일에 문제가 있으면 반환
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       500:
 *         description: 서버 오류
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
*/
router.get('/:id/image', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const path = await userService.getProfileImagePath(id);

        res.sendFile(path);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

module.exports = router;

