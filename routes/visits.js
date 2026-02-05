const express = require('express');
const router = express.Router();
const VisitService = require('../services/visitService');
const catchAsync = require('../utils/catchAsync');

/**
 * @swagger
 * /visits:
 *   post:
 *     tags:
 *       - visits
 *     summary: 리뷰 등록
 *     description: 리뷰를 등록합니다.
 *     responses:
 *       201:
 *         description: 성공
 *       500:
 *         description: 서버 오류
 */

router.post('/', catchAsync(async (req, res) => {
    const visitData = req.body
    const result = await VisitService.postVisits(visitData)

    res.status(201).json({
        success: true,
        message: "정보가 성공적으로 저장되었습니다.",
        data: result
    });
}));

/**
 * @swagger
 * /visits:
 *   get:
 *     tags:
 *       - visits
 *     summary: 모든 리뷰 조회
 *     description: 등록된 모든 리뷰를 반환합니다.
 *     responses:
 *       200:
 *         description: 성공
 *       500:
 *         description: 서버 오류
 */

router.get('/', catchAsync(async (req, res) => {
    const visits = await VisitService.getAllVisits();
    res.status(200).json(visits);
}));

/**
 * @swagger
 * /visits/likes:
 *   post:
 *     tags:
 *       - visits
 *     summary: 좋아요 등록
 *     description: 특정 리뷰에 대해 좋아요 등록합니다.
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: uesrId
 *         type: number
 *       - in: body
 *         name: visitsId
 *         type: number
 *     responses:
 *       201:
 *         description: 좋아요 완료
 *       500:
 *         description: 서버 오류
 */

router.post('/likes', catchAsync(async (req, res) => {
    const { userId, visitId } = req.body;
    await VisitService.toggleLike(userId, visitId, true);
    res.status(201).json({ message: "좋아요 완료" });
}));


/**
 * @swagger
 * /restaurants/likes:
 *   delete:
 *     tags:
 *       - restaurants
 *     summary: 좋아요 취소
 *     description: 등록된 좋아요를 삭제합니다.
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: uesrId
 *         type: number
 *       - in: body
 *         name: restaurantId
 *         type: number
 *   responses:
 *     201:
 *       description: 좋아요 완료
 *     500:
 *       description: 서버 오류
 */

router.delete('/likes', catchAsync(async (req, res) => {
    const { userId, visitId } = req.body;
    await VisitService.toggleLike(userId, visitId, false);
    res.status(201).json({ message: "좋아요 취소 완료" });
}));
/**
 * @swagger
 * /restaurants/likes/status:
 *   get:
 *     tags:
 *       - restaurants
 *     summary: 좋아요 상태 확인
 *     description: 유저가 해당 맛집을 좋아하는지 여부를 반환합니다.
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *   responses:
 *     200:
 *       description: 상태값 반환 성공
 */

router.get('/likes/status', catchAsync(async (req, res) => {
    const { userId, visitId } = req.query;
    const isLiked = await VisitService.getLikeStatus(userId, visitId);
    res.status(200).json({ isLiked });
}));

module.exports = router;