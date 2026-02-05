const express = require('express');
const router = express.Router();
const RestaurantService = require('../services/restaurantService');
const catchAsync = require('../utils/catchAsync');

/**
 * @swagger
 * /restaurants:
 *   post:
 *     tags:
 *       - restaurants
 *     summary: 식당 등록
 *     description: 식당을 등록합니다.
 *     responses:
 *       201:
 *         description: 성공
 *       500:
 *         description: 서버 오류
 */

router.post('/', catchAsync(async (req, res) => {
    const userData = req.body
    const result = await RestaurantService.postRestaurants(userData)

    res.status(201).json({
        success: true,
        message: "정보가 성공적으로 저장되었습니다.",
        data: result
    });
}));

router.post('/', catchAsync(async (req, res) => {
    const userData = req.body
    const result = await RestaurantService.postRestaurants(userData)

    res.status(201).json({
        success: true,
        message: "정보가 성공적으로 저장되었습니다.",
        data: result
    });
}));

/**
 * @swagger
 * /restaurants:
 *   get:
 *     tags:
 *       - restaurants
 *     summary: 모든 식당 조회
 *     description: 등록된 모든 식당을 반환합니다.
 *     responses:
 *       200:
 *         description: 성공
 *       500:
 *         description: 서버 오류
 */

router.get('/', catchAsync(async (req, res) => {
    const restaurants = await RestaurantService.getAllRestaurants();
    res.status(200).json(restaurants);
}));

/**
 * @swagger
 * /restaurants:
 *   get:
 *     tags:
 *       - restaurants
 *     summary: 특정 식당 조회
 *     description: id로 등록된 특정 식당을 반환합니다.
 *     responses:
 *       200:
 *         description: 성공
 *       500:
 *         description: 서버 오류
 */

router.get('/:id', catchAsync(async (req, res) => {
    let {id} = req.params
    id = parseInt(id)
    const restaurants = await RestaurantService.getRestaurants(id);
    res.status(200).json(restaurants);
}));
/**
 * @swagger
 * /restaurants/search:
 *   get:
 *     tags:
 *       - restaurants
 *     summary: 맛집 검색
 *     description: 키워드를 통해 맛집 정보를 검색합니다.
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: 성공
 *       400:
 *         description: 검색어 누락
 *       500:
 *         description: 서버 오류
 */

router.get('/search', catchAsync(async (req, res) => {
    const {q, category} = req.query;
    if (!q && !category) {
        return res.status(400).json({ message: "검색어를 입력하세요.." });
    }
    const results = await RestaurantService.getBySearch({
        q,
        category
    });


    res.status(200).json(results);
}));

/**
 * @swagger
 * /restaurants/search:
 *   get:
 *     tags:
 *       - restaurants
 *     summary: 맛집 검색
 *     description: 키워드를 통해 카카오 api 맛집 정보를 검색합니다.
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: 성공
 *       400:
 *         description: 검색어 누락
 *       500:
 *         description: 서버 오류
 */

router.get('/kakao', catchAsync(async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ message: "검색어를 입력하세요." });
    const results = await RestaurantService.searchKakao(query);
    res.status(200).json(results);
}));

/**
 * @swagger
 * /restaurants:
 *   get:
 *     tags:
 *       - restaurants
 *     summary: 특정 식당 조회
 *     description: id로 등록된 특정 식당을 반환합니다.
 *     responses:
 *       200:
 *         description: 성공
 *       500:
 *         description: 서버 오류
 */

router.get('/:id', catchAsync(async (req, res) => {
    let {id} = req.params
    id = parseInt(id)
    const restaurants = await RestaurantService.getRestaurants(id);
    res.status(200).json(restaurants);
}));

/**
 * @swagger
 * /restaurants/likes:
 *   post:
 *     tags:
 *       - restaurants
 *     summary: 좋아요 등록
 *     description: 특정 맛집에 대해 좋아요 등록합니다.
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: uesrId
 *         type: number
 *       - in: body
 *         name: restaurantId
 *         type: number
 *     responses:
 *       201:
 *         description: 좋아요 완료
 *       500:
 *         description: 서버 오류
 */

router.post('/likes', catchAsync(async (req, res) => {
    const { userId, restaurantId } = req.body;
    await RestaurantService.toggleLike(userId, restaurantId, true);
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
    const { userId, restaurantId } = req.body;
    await RestaurantService.toggleLike(userId, restaurantId, false);
    res.status(200).json({ message: "좋아요 취소 완료" });
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
    const { userId, restaurantId } = req.query;
    const isLiked = await RestaurantService.getLikeStatus(userId, restaurantId);
    res.status(200).json({ isLiked });
}));

module.exports = router;