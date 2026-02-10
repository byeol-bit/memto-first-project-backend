const express = require('express');
const router = express.Router();
const RestaurantService = require('../services/restaurantService');
const catchAsync = require('../utils/catchAsync');

/**
 * @swagger
 * definitions:
 *   restaurants:
 *     description: restaurants 형태에 대한 내용 입니다.
 *     type: object
 *     properties:
 *       id:
 *         type: number
 *       name:
 *         type: string
 *       address:
 *         type: string
 *       phone_number:
 *         type: string
 *       category:
 *         type: string
 *       latitude:
 *         type: number
 *       longitude:
 *         type: number
 *       kakao-place_id:
 *         type: string
 *       created_at:
 *         type: string
 *       updated_at:
 *         type: string
*/

/**
 * @swagger
 * /restaurants:
 *   post:
 *     tags:
 *       - restaurants
 *     summary: 식당 등록
 *     description: 새로운 식당을 등록합니다.
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         schema:
 *           type: object
 *           required:
 *             - name
 *           properties:
 *             name:
 *               type: string
 *             address:
 *               type: string
 *             phone_number:
 *               type: string
 *             category:
 *               type: string
 *             latitue:
 *               type: number
 *             longtitue:
 *               type: number
 *             kakao_place_id:
 *               type: string
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: 식당 생성 및 값 반환
 *         schema:
 *           $ref: "#/definitions/restaurants"
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
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 성공
 *         schema:
 *           type: array
 *           items:
 *             $ref: "#/definitions/restaurants"
 *       500:
 *         description: 서버 오류
 */

router.get('/', catchAsync(async (req, res) => {
    const restaurants = await RestaurantService.getAllRestaurants();
    res.status(200).json(restaurants);
}));

/**
 * @swagger
 * /restaurants/search:
 *   get:
 *     tags:
 *       - restaurants
 *     summary: 맛집 검색
 *     description: |
 *       키워드를 통해 맛집 정보를 검색합니다.
 *       "q 또는 category 파라미터가 최소 하나는 필요합니다."
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: q
 *         type: string
 *       - in: query
 *         name: category
 *         type: string
 *     responses:
 *       200:
 *         description: 성공
 *         schema:
 *           type: array
 *           items:
 *             tpye: object
 *             
 *       400:
 *         description: 검색어 누락
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
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
 * /restaurants/kakao:
 *   get:
 *     tags:
 *       - restaurants
 *     summary: 카카오 api 맛집 검색
 *     description: 키워드를 통해 카카오 api 맛집 정보를 검색합니다.
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               kakao_id:
 *                 type: number
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               category:
 *                 type: string
 *               x:
 *                 type: number
 *               y:
 *                 type: number
 *       400:
 *         description: 검색어 누락
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       500:
 *         description: 서버 오류
 */

router.get('/kakao', catchAsync(async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ message: "검색어를 입력하세요." });
    const results = await RestaurantService.kakaoSearch(query);
    res.status(200).json(results);
}));

/**
 * @swagger
 * /restaurants/{id}:
 *   get:
 *     tags:
 *       - restaurants
 *     summary: 특정 식당 조회
 *     description: |
 *       kakao_id로 DB에 등록된 특정 식당을 반환합니다.
 *       restaurants 고유 id가 아닙니다. kakao_id 사용하셔야 합니다.
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: kakaoId
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: |
 *           특정 식당 반환
 *           없는 id의 경우 오류코드가 아닌 빈 배열 반환
 *         schema:
 *           $ref: "#/definitions/restaurants"
 *       400:
 *         description: Id 누락
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       500:
 *         description: 서버 오류
 */

router.get('/:id', catchAsync(async (req, res) => {
    let {id} = req.params
    if (!id) return res.status(400).json({ message: "검색어를 입력하세요." });
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
 *     summary: 식당 좋아요 등록
 *     description: |
 *       특정 맛집에 대해 좋아요 등록합니다.
 *       DB에 등록된 restaurant_id가 필요합니다. kakak_id가 아닙니다.
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
 *             restaurantId:
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
 *     summary: 식당 좋아요 삭제
 *     description: |
 *       특정 맛집에 대해 등록된 좋아요를 취소합니다.
 *       DB restaurants Id가 필요합니다.
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
 *             restaurantId:
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
 *         type: number
 *       - in: query
 *         name: restaurantsId
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
    const { userId, restaurantId } = req.query;
    const isLiked = await RestaurantService.getLikeStatus(userId, restaurantId);
    res.status(200).json({ isLiked });
}));

module.exports = router;