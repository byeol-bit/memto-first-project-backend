const express = require('express');
const router = express.Router();
const userService = require('../services/userService');

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
 *       profileImage:
 *         type: string
 *       introduction:
 *         type: string
 *       category:
 *         type: string
 *       createdAt:
 *         type: string
 *       updatedAt:
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
 *           properties:
 *             nickname:
 *               type: string
 *             introduction:
 *               type: string
 *             category:
 *               type: string
 *               enum: ['푸드파이터', '먹방유튜버', '동네맛집고수']
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
router.post('/', (req, res) => {
    userService.createUsers(req.body, (err, id) => {
        if (err == null) {
            res.status(201).json({id});
        } else if (err.statusCode == 400) {
            res.status(err.statusCode).json({message: err.message});
        } else {
            res.statusCode(err.statusCode);
        }
    });
});

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
router.get('/', (_, res) => {
    userService.getUsers((err, users) => {
        if (err == null) {
            res.status(200).json(users);
        } else {
            console.log(err);
            res.statusCode(err.statusCode);
        }
    });
});

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
router.get('/search', (req, res) => {
    userService.searchUsers(req.query, (err, users) => {
        if (err == null) {
            res.status(200).json(users);
        } else {
            res.statusCode(err.statusCode);
        }
    })
});

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
router.get('/:id', (req, res) => {
    userService.getUserById(req.params.id, (err, user) => {
        if (err == null) {
            res.status(200).json(user);
        } else if (err.statusCode == 400) {
            res.status(err.statusCode).json({message: err.message});
        } else if (err.statusCode == 404) {
            res.status(err.statusCode).json({message: err.message});
        } else {
            res.statusCode(err.statusCode);
        }
    });
});

module.exports = router;

