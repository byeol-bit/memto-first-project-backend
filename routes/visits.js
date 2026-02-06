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

router.get('/search', catchAsync(async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ message: "검색어를 입력하세요." });
    const results = await RestaurantService.searchPlaces(query);
    res.status(200).json(results);
}));


router.get('/search', catchAsync(async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ message: "검색어를 입력하세요." });
    const results = await RestaurantService.searchPlaces(query);
    res.status(200).json(results);
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
/*
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL, 
    restaurant_id INT NULL,
    visit_date DATE,
    review TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
*/
/**
 * @swagger
 * /visits/following:
 *   get:
 *     tags:
 *       - visits
 *     summary: 팔로잉들의 방문기록
 *     description: 팔로잉한 사람들의 방문기록을 최신순으로 정렬해 넘겨줍니다.
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         schema:
 *           type: object
 *           required:
 *             - userId
 *           properties:
 *             userId:
 *               type: number
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 모든 유저 반환
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: number
 *             user_id:
 *               type: number
 *             restaurant_id:
 *               type: number
 *             visit_date:
 *               type: string
 *             review:
 *               type: string
 *             created_at:
 *               type: string
 *             updated_at:
 *               type: string
 *       500:
 *         description: 서버 오류
*/
router.get('/following', catchAsync(async (req, res) => {
    const { userId } = req.query;
    const visits = await VisitService.getFollowingVisits(userId);
    res.status(200).json(visits);
}));

module.exports = router;