const express = require('express');
const router = express.Router();
const followService = require('../services/followService');

/**
 * @swagger
 * /follows/{id}:
 *   post:
 *     tags:
 *       - follows
 *     summary: 팔로우
 *     description: 상대를 팔로우합니다. 
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         type: number
 *         required: true
 *       - in: body
 *         schema:
 *           type: object
 *           required:
 *             - myId
 *           properties:
 *             myId:
 *               type: number
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
        let followingId = parseInt(req.params.id);
        let followResult = await followService.follow(req.body.myId, followingId);
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
 *     description: 상대를 언팔로우합니다.
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         type: number
 *         required: true
 *       - in: body
 *         schema:
 *           type: object
 *           required:
 *             - myId
 *           properties:
 *             myId:
 *               type: number
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
        let followingId = parseInt(req.params.id);
        let unfollowResult = await followService.unfollow(req.body.myId, followingId);
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
 * /follows:
 *   get:
 *     tags:
 *       - follows
 *     summary: 팔로우 상태 확인
 *     description: 팔로우 여부를 확인합니다.
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         schema:
 *           type: object
 *           required:
 *             - followerId
 *             - followingId
 *           properties:
 *             followerId:
 *               type: number
 *             followingId:
 *               type: number
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
router.get('/', async (req, res) => {
    try {
        let {followerId, followingId} = req.body;
        let isFollowResult = await followService.isFollow(followerId, followingId);
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

module.exports = router;