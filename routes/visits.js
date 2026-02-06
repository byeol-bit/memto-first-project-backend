const express = require('express');
const router = express.Router();
const VisitService = require('../services/visitService');
const catchAsync = require('../utils/catchAsync');

/**
 * @swagger
 * definitions:
 *   visits:
 *     description: visits 형태에 대한 내용 입니다.
 *     type: object
 *     properties:
 *       id:
 *         type: number
 *       user_id:
 *         type: numer
 *       restaurants_id:
 *         type: number
 *       visit_date:
 *         type: string
 *       review:
 *         type: string
 *       created_at:
 *         type: string
 *       updated_at:
 *         type: string
*/

/**
 * @swagger
 * /visits:
 *   post:
 *     tags:
 *       - visits
 *     summary: 리뷰 등록
 *     description: 새로운 리뷰를 등록합니다.
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         schema:
 *           type: object
 *           required:
 *             - userId
 *             - restaurantId
 *             - visitDate
 *             - review
 *           properties:
 *             userId:
 *               type: number
 *             restaurantId:
 *               type: number
 *             visitDate:
 *               type: string
 *             review:
 *               type: string
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: 리뷰 생성 및 값 반환
 *         schema:
 *           $ref: "#/definitions/visits"
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
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 성공
 *         schema:
 *           type: array
 *           items:
 *             $ref: "#/definitions/visits"
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /visits/:{userId}:
 *   get:
 *     tags:
 *       - visits
 *     summary: userId 기반 리뷰 조회
 *     description: |
 *       해당 유저가 작성한 모든 리뷰를 반환합니다.
 *       전체 반환, 식당id 기반과 같은 url을 사용하고 있으니 쿼리에 주의가 필요합니다.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: userId
 *         type: number
 *     responses:
 *       200:
 *         description: 성공
 *         schema:
 *           type: array
 *           items:
 *             $ref: "#/definitions/visits"
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /visits/:{restaurantId}:
 *   get:
 *     tags:
 *       - visits
 *     summary: restaurantId 기반 리뷰 조회
 *     description: |
 *       해당 식당에 작성한 모든 리뷰를 반환합니다.
 *       전체 반환, 유저id 기반과 같은 url을 사용하고 있으니 쿼리에 주의가 필요합니다.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         type: number
 *     responses:
 *       200:
 *         description: 성공
 *         schema:
 *           type: array
 *           items:
 *             $ref: "#/definitions/visits"
 *       500:
 *         description: 서버 오류
 */

router.get('/', catchAsync(async (req, res) => {
    const {userId, restaurantId} = req.query;

    let visits;

    if (userId) {
        visits = await VisitService.getVisitByUser(userId);
    }

    else if (restaurantId) {
        visits = await VisitService.getVisitByRestaurant(restaurantId);
    }

    else {
        visits = await VisitService.getAllVisit();
    }

    res.status(200).json(visits);
}));

/**
 * @swagger
 * /visits/likes:
 *   post:
 *     tags:
 *       - visits
 *     summary: 리뷰 좋아요 등록
 *     description: |
 *       특정 리뷰에 대해 좋아요 등록합니다.
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             userId:
 *               type: number
 *             visitId:
 *               type: number
 *     responses:
 *       201:
 *         description: 좋아요 완료
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
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
 * /visits/likes:
 *   delete:
 *     tags:
 *       - visits
 *     summary: 리뷰 좋아요 삭제
 *     description: |
 *       특정 리뷰에 대해 등록된 좋아요를 취소합니다.
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             userId:
 *               type: number
 *             visitId:
 *               type: number
 *     responses:
 *       200:
 *         description: 좋아요 취소 완료
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       500:
 *         description: 서버 오류
 */

router.delete('/likes', catchAsync(async (req, res) => {
    const { userId, visitId } = req.body;
    await VisitService.toggleLike(userId, visitId, false);
    res.status(201).json({ message: "좋아요 취소 완료" });
}));

/**
 * @swagger
 * /visits/likes/status:
 *   get:
 *     tags:
 *       - visits
 *     summary: 좋아요 상태 확인
 *     description: 유저가 해당 리뷰를 좋아하는지 여부를 반환합니다.
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         type: number
 *       - in: query
 *         name: visitId
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: 상태값 반환 성공
 *         schema:
 *           type: object
 *           properties:
 *             isLiked:
 *               type: boolean
 *               example: true
 */

router.get('/likes/status', catchAsync(async (req, res) => {
    const { userId, visitId } = req.query;
    const isLiked = await VisitService.getLikeStatus(userId, visitId);
    res.status(200).json({ isLiked });
}));

module.exports = router;