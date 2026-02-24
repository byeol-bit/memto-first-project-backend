const express = require('express');
const router = express.Router();
const followService = require('../services/followService');
const catchAsync = require('../utils/catchAsync');
const jwtUtil = require('../utils/jwt');

/**
 * @swagger
 * /follows/{id}:
 *   post:
 *     tags:
 *       - follows
 *     summary: 팔로우
 *     description: jwt의 id로 상대를 팔로우합니다.
 *     security:
 *       - jwtCookie: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         type: number
 *         required: true
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 팔로우 성공
 *       400:
 *         description: 타입 오류 또는 스스로를 팔로우할 때 발생
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       409:
 *         description: 이미 팔로우된 상태일 때 발생
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       500:
 *         description: 서버 오류
*/
router.post('/:id', async (req, res) => {
    try {
        let token = jwtUtil.decode(req.cookies.token);
        let followingId = parseInt(req.params.id);
        let followResult = await followService.follow(token?.id, followingId);
        if (followResult.statusCode != 200) {
            res.status(followResult.statusCode).json({ message: followResult.message });
        } else {
            res.status(followResult.statusCode).end();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /follows/{id}:
 *   delete:
 *     tags:
 *       - follows
 *     summary: 언팔로우
 *     description: jwt의 id로 상대를 언팔로우합니다.
 *     security:
 *       - jwtCookie: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         type: number
 *         required: true
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 언팔로우 성공
 *       400:
 *         description: 타입 오류 또는 스스로를 언팔로우할 때 발생
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       409:
 *         description: 이미 언팔로우된 상태일 때 발생
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       500:
 *         description: 서버 오류
*/
router.delete('/:id', async (req, res) => {
    try {
        let token = jwtUtil.decode(req.cookies.token);
        let followingId = parseInt(req.params.id);
        let unfollowResult = await followService.unfollow(token?.id, followingId);
        if (unfollowResult.statusCode != 200) {
            res.status(unfollowResult.statusCode).json({ message: unfollowResult.message });
        } else {
            res.status(unfollowResult.statusCode).end();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /follows/{id}:
 *   get:
 *     tags:
 *       - follows
 *     summary: 팔로우 상태 확인
 *     description: 팔로우 여부를 확인합니다.
 *     security:
 *       - jwtCookie: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         type: number
 *         required: true
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 언팔로우 성공
 *         schema:
 *           type: object
 *           properties:
 *             isFollow:
 *               type: boolean
 *       400:
 *         description: 타입 오류 또는 같은 아이디를 제공했을 때 발생
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       500:
 *         description: 서버 오류
*/
router.get('/:id', async (req, res) => {
    try {
        let token = jwtUtil.decode(req.cookies.token);
        let id = parseInt(req.params.id);
        let isFollowResult = await followService.isFollow(token?.id, id);
        if (isFollowResult.statusCode != 200) {
            res.status(isFollowResult.statusCode).json({
                message: isFollowResult.message
            });
        } else {
            res.status(isFollowResult.statusCode).json({
                isFollow: isFollowResult.isFollowed
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /follows/{id}/following-count:
 *   get:
 *     tags:
 *       - follows
 *     summary: 팔로잉 수
 *     description: 팔로잉한 유저의 수를 반환합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         type: number
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 팔로잉 수 반환
 *         schema:
 *           type: object
 *           properties:
 *             count:
 *               type: number
 *       400:
 *         description: 타입 오류
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       500:
 *         description: 서버 오류
*/
router.get('/:id/following-count', catchAsync(async (req, res) => {
    let result = await followService.getFollowingCount(req.params.id);
    if (typeof result == 'number') {
        res.status(200).json({count: result});
    } else {
        res.status(result.statusCode).json({
            message: result.message
        });
    }
}));

/**
 * @swagger
 * /follows/{id}/follower-count:
 *   get:
 *     tags:
 *       - follows
 *     summary: 팔로워 수
 *     description: 팔로워의 수를 반환합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         type: number
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 팔로워 수 반환
 *         schema:
 *           type: object
 *           properties:
 *             count:
 *               type: number
 *       400:
 *         description: 타입 오류
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       500:
 *         description: 서버 오류
*/
router.get('/:id/follower-count', catchAsync(async (req, res) => {
    let result = await followService.getFollowerCount(req.params.id);
    if (typeof result == 'number') {
        res.status(200).json({count: result});
    } else {
        res.status(result.statusCode).json({
            message: result.message
        });
    }
}));

/**
 * @swagger
 * /follows/followings/{id}:
 *   get:
 *     tags:
 *       - follows
 *     summary: 팔로잉 목록
 *     description: 팔로잉한 목록을 가져옵니다. 토큰이 있을 경우, 응답에 follow 항목이 추가됩니다. 페이지는 1부터 시작합니다.
 *     security:
 *       - jwtCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         type: number
 *       - in: query
 *         name: page
 *         type: string
 *       - in: query
 *         name: limit
 *         type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 팔로잉 목록
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - id
 *               - nickname
 *               - category
 *             properties:
 *               id:
 *                 type: string
 *               nickname:
 *                 type: string
 *               category:
 *                 type: string
 *               follow:
 *                 type: string
 *       400:
 *         description: 타입 오류
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       500:
 *         description: 서버 오류
*/
router.get('/followings/:id', catchAsync(async (req, res) => {
    let token = jwtUtil.decode(req.cookies.token);
    const id = parseInt(req.params.id);
    let result = await followService.getFollowings(token?.id, id, req.query.page ?? 1, req.query.limit ?? 10);
    if (result instanceof Error) {
        res.status(result.statusCode).json({
            message: result.message
        });
    } else {
        res.status(200).json(result);
    }
}));

/**
 * @swagger
 * /follows/followers/{id}:
 *   get:
 *     tags:
 *       - follows
 *     summary: 팔로워 목록
 *     description: 팔로워의 목록을 가져옵니다. 토큰이 있을 경우, 응답에 follow 항목이 추가됩니다. 페이지는 1부터 시작합니다.
 *     security:
 *       - jwtCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         type: number
 *       - in: query
 *         name: page
 *         type: string
 *       - in: query
 *         name: limit
 *         type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 팔로워 목록
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - id
 *               - nickname
 *               - category
 *             properties:
 *               id:
 *                 type: string
 *               nickname:
 *                 type: string
 *               category:
 *                 type: string
 *               follow:
 *                 type: string
 *       400:
 *         description: 타입 오류
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       500:
 *         description: 서버 오류
*/
router.get('/followers/:id', catchAsync(async (req, res) => {
    let token = jwtUtil.decode(req.cookies.token);
    const id = parseInt(req.params.id);
    let result = await followService.getFollowers(token?.id, id, req.query.page ?? 1, req.query.limit ?? 10);
    if (result instanceof Error) {
        res.status(result.statusCode).json({
            message: result.message
        });
    } else {
        res.status(200).json(result);
    }
}));

module.exports = router;