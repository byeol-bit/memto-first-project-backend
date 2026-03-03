const express = require('express')
const router = express.Router()
const VisitService = require('../services/visitService')
const imageService = require('../services/imageService')
const catchAsync = require('../utils/catchAsync')
const multer = require('multer');
const upload = multer({ dest: 'images/temp/' });
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
 *         type: number
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
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: userId
 *         type: number
 *         required: true
 *       - in: formData
 *         name: restaurantId
 *         type: number
 *         required: true
 *       - in: formData
 *         name: visit_date
 *         type: string
 *         required: true
 *       - in: formData
 *         name: review
 *         type: string
 *         required: true
 *       - in: formData
 *         name: image
 *         type: file
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: 방문 기록(리뷰) 생성 및 값 반환 성공
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "정보가 성공적으로 저장되었습니다."
 *             data:
 *               type: array
 *               items:
 *                 $ref: "#/definitions/visits"
 *             paths:
 *               type: array
 *               description: 저장된 이미지 파일의 경로 리스트
 *               items:
 *                 type: string
 *                 example: "https://...../image1.jpg"
 *       400:
 *         description: 필수 값 누락
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       500:
 *         description: 서버 오류
 */

router.post('/', upload.array('image', 5), catchAsync(async (req, res) => {
    const visitData = req.body
    if (!visitData.userId || !visitData.restaurantId || !visitData.review) {
        const error = new Error("필수 값 누락");
        error.status = 400;
        throw error;
    }
    const result = await VisitService.postVisits(visitData)
    let paths = []
    if (req.files) {
        paths = await imageService.saveImage(req.files, 'visits', result[0].id)
    }
    res.status(201).json({
        success: true,
        message: "정보가 성공적으로 저장되었습니다.",
        data: result,
        paths: paths
    });
}));

/**
 * @swagger
 * /visits?cursor='':
 *   get:
 *     tags:
 *       - visits
 *     summary: 전체 리뷰 목록 조회 (페이지네이션)
 *     description: 유저나 식당 필터 없이 전체 리뷰를 최신순으로 조회합니다. 커서 기반 페이지네이션을 지원합니다.
 *     parameters:
 *       - in: query
 *         name: cursor
 *         type: integer
 *         description: 다음 페이지 조회를 위한 커서 값
 *     responses:
 *       200:
 *         description: 전체 리뷰 목록 조회 성공
 *         schema:
 *           type: array
 *           items:
 *             allOf:
 *               - $ref: "#/definitions/visits"
 *               - type: object
 *             properties:
 *               visitLikeCount:
 *                 type: integer
 *                 example: 0
 *               restaurant:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   address:
 *                     type: string
 *                   phone_number:
 *                     type: string
 *                   category:
 *                     type: string
 *                   latitude:
 *                     type: string
 *                   longtitde:
 *                     type: string
 *                   kakao_place_id:
 *                     type: string
 *                   restaurantLikeCount:
 *                     type: integer
 *               user:
 *                 type: object
 *                 properties:
 *                   nickname:
 *                     type: string
 *                   profile_image:
 *                     type: string
 *                     nullable: true
 *                   introduction:
 *                     type: string
 *                   category:
 *                     type: string
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /visits?userId='':
 *   get:
 *     tags:
 *       - visits
 *     summary: 특정 유저의 리뷰 목록 조회
 *     description: 쿼리 파라미터 `userId`를 사용하여 해당 유저가 작성한 모든 리뷰를 조회합니다. 사용자가 몇개의 리뷰를 작성했는지도 포함합니다.
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         type: integer
 *         description: 조회할 유저의 고유 ID
 *     responses:
 *       200:
 *         description: 유저 리뷰 조회 성공
 *         schema:
 *           type: array
 *           items:
 *             allOf:
 *               - $ref: "#/definitions/visits"
 *               - type: object
 *             properties:
 *               visitLikeCount:
 *                 type: integer
 *                 example: 0
 *               restaurant:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   address:
 *                     type: string
 *                   phone_number:
 *                     type: string
 *                   category:
 *                     type: string
 *                   latitude:
 *                     type: string
 *                   longtitde:
 *                     type: string
 *                   kakao_place_id:
 *                     type: string
 *                   restaurantLikeCount:
 *                     type: integer
 *               user:
 *                 type: object
 *                 properties:
 *                   nickname:
 *                     type: string
 *                   profile_image:
 *                     type: string
 *                     nullable: true
 *                   introduction:
 *                     type: string
 *                   category:
 *                     type: string
 *                   total_review_count:
 *                     type: integer
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /visits?restaurantId='':
 *   get:
 *     tags:
 *       - visits
 *     summary: 특정 식당의 리뷰 목록 조회
 *     description: 쿼리 파라미터 `restaurantId`를 사용하여 해당 식당에 달린 모든 리뷰를 조회합니다.
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         required: true
 *         type: integer
 *         description: 조회할 식당의 고유 ID
 *     responses:
 *       200:
 *         description: 식당 리뷰 조회 성공
 *         schema:
 *           type: array
 *           items:
 *             allOf:
 *               - $ref: "#/definitions/visits"
 *               - type: object
 *             properties:
 *               visitLikeCount:
 *                 type: integer
 *                 example: 0
 *               restaurant:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   address:
 *                     type: string
 *                   phone_number:
 *                     type: string
 *                   category:
 *                     type: string
 *                   latitude:
 *                     type: string
 *                   longtitde:
 *                     type: string
 *                   kakao_place_id:
 *                     type: string
 *                   restaurantLikeCount:
 *                     type: integer
 *               user:
 *                 type: object
 *                 properties:
 *                   nickname:
 *                     type: string
 *                   profile_image:
 *                     type: string
 *                     nullable: true
 *                   introduction:
 *                     type: string
 *                   category:
 *                     type: string
 *       500:
 *         description: 서버 오류
 */


router.get('/', catchAsync(async (req, res) => {
    const {userId, restaurantId} = req.query;

    let visits;

    if (userId) {
        const cursor = parseInt(req.query.cursor) || 0;
        visits = await VisitService.getVisitByUser(userId, cursor);
    }

    else if (restaurantId) {
        const cursor = parseInt(req.query.cursor) || 0;
        visits = await VisitService.getVisitByRestaurant(restaurantId, cursor);
    }

    else {
        const cursor = parseInt(req.query.cursor) || 0;
        visits = await VisitService.getAllVisit(cursor);
        return res.status(200).json({
            success: true,
            data: visits.data,
            hasNextPage: visits.hasNextPage,
            nextCursor: visits.nextCursor
        });
    }

    res.status(200).json(visits);
}));

/**
 * @swagger
 * /visits/{id}:
 *   patch:
 *     tags:
 *       - visits
 *     summary: 리뷰 수정
 *     description: |
 *       특정 리뷰를 수정합니다. 수정 가능한 필드는 다음과 같습니다: visit_date, review, image_urls.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         type: number
 *     responses:
 *       200:
 *         description: 성공
 *         schema:
 *           type: array
 *           items:
 *             allOf:
 *               - $ref: "#/definitions/visits"
 *               - type: object
 *             properties:
 *               restaurant:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   address:
 *                     type: string
 *                   phone_number:
 *                     type: string
 *                   category:
 *                     type: string
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *                   kakao-place_id:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                   updated_at:
 *                     type: string
 *       500:
 *         description: 서버 오류
 */

router.patch('/:id', upload.array('image', 5), catchAsync(async (req, res) => {
    const visitId = req.params.id;
    const userId = req.user.id; 
    const updateData = req.body;
    
    if (updateData.visit_date && !updateData.visit_date.includes('-')) {
        updateData.visit_date = updateData.visit_date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
    }

    const result = await VisitService.patchVisit(visitId, userId, updateData, req.files);

    res.status(200).json({
        success: true,
        message: "리뷰가 수정되었습니다."
    });
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
 * /visits/likes/status?userId=''&visitId='':
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

/**
 * @swagger
 * /visits/{id}/image:
 *   get:
 *     tags:
 *       - visits
 *     summary: 리뷰 이미지 획득
 *     description: 리뷰에 붙은 이미지를 획득합니다.
 *     parameters:
 *       - in: param
 *         name: visitId
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: 이미지 반환 성공
 */

router.get('/:id/image', catchAsync(async (req, res) => {
    const visitId = req.params.id;
    const result = await imageService.getImagePath(visitId, 'visits');

    res.status(200).json(result);
}));

module.exports = router;