const express = require('express');
const multer = require('multer');
const userService = require('../services/userService');
const catchAsync = require('../utils/catchAsync');
const jwtUtil = require('../utils/jwt');

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
 *       loginId:
 *         type: string
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
 *     description: 새로운 고수를 등록합니다. 이미지가 없어도 작동합니다.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: loginId
 *         type: string
 *       - in: formData
 *         name: nickname
 *         type: string
 *       - in: formData
 *         name: introduction
 *         type: string
 *       - in: formData
 *         name: password
 *         type: string
 *       - in: formData
 *         name: image
 *         type: file
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
router.post('/', upload.single('image'), catchAsync(async (req, res) => {
    let result = await userService.createUsers(req.body, req.file);
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
 * /users/login:
 *   post:
 *     tags:
 *       - users
 *     summary: 로그인
 *     description: 로그인 아이디와 비밀번호로 로그인합니다.
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         schema:
 *           type: object
 *           required:
 *             - loginId
 *             - password
 *           properties:
 *             loginId:
 *               type: string
 *             password:
 *               type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         headers:
 *           description: jwt 발급
 *           token:
 *             schema:
 *               type: string
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *       400:
 *         description: 잘못된 값 입력 또는 로그인 실패
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       500:
 *         description: 서버 오류
*/
router.post('/login', catchAsync(async (req, res) => {
    let body = req.body ?? {};
    let result = await userService.login(body.loginId, body.password);
    if (result instanceof Error) {
        res.status(result.statusCode).json(result.message);
    } else {
        const {token, id} = result;
        let cookieOption = {
            path: '/',
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 30 * 60 * 1000 // 30분
        };
        res.cookie("token", token, cookieOption).status(200).json({id}).end();
    }
}));

/**
 * @swagger
 * /users/logout:
 *   post:
 *     tags:
 *       - users
 *     summary: 로그아웃
 *     description: 로그아웃합니다.
 *     responses:
 *       200:
 *         description: 로그아웃 성공
*/
router.post('/logout', catchAsync(async (_, res) => {
    res.clearCookie('token').status(200).end();
}));

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - users
 *     summary: 모든 고수 조회
 *     description: 등록된 모든 고수들을 반환합니다. 페이지는 1부터 시작합니다.
 *     consumes:
 *       - application/json
 *     parameters:
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
 *         description: 모든 유저 반환
 *         schema:
 *           type: array
 *           items:
 *             $ref: "#/definitions/User"
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
router.get('/', catchAsync(async (req, res) => {
    let users = await userService.getUsers(req.query.page ?? 1, req.query.limit ?? 10);
    res.status(200).json(users);
}));

/**
 * @swagger
 * /users/search:
 *   get:
 *     tags:
 *       - users
 *     summary: 고수 검색
 *     description: 닉네임, 카테고리에 맞는 고수를 검색합니다. 페이지는 1부터 시작합니다.
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
 *         description: 모든 유저 반환
 *         schema:
 *           type: array
 *           items:
 *             $ref: "#/definitions/User"
 *       500:
 *         description: 서버 오류
*/
router.get('/search', catchAsync(async (req, res) => { 
    let result = await userService.searchUsers(req.query, req.query.page ?? 1, req.query.limit ?? 10);
    if (result instanceof Error) {
        res.status(result.statusCode).json({message: result.message});
    } else {
        res.status(200).json(result);
    }
}));

/**
 * @swagger
 * /users/random:
 *   get:
 *     tags:
 *       - users
 *     summary: 랜덤 유저 반환
 *     description: 원하는 수의 랜덤 유저를 반환합니다. limit가 없을 경우 3명을 반환합니다.
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: limit
 *         type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 랜덤 유저 반환
 *         schema:
 *           type: array
 *           items:
 *             $ref: "#/definitions/User"
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
router.get('/random', catchAsync(async (req, res) => {
    let result = await userService.getRandomUsers(req.query.limit ?? 3);
    if (result instanceof Error) {
        res.status(result.statusCode).json({message: result.message});
    } else {
        res.status(200).json({users: result});
    }
}))

/**
 * @swagger
 * /users/check-id:
 *   get:
 *     tags:
 *       - users
 *     summary: 아이디 중복 확인
 *     description: 로그인 아이디의 중복 여부를 확인합니다.
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: loginId
 *         type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 결과 반환
 *         schema:
 *           type: object
 *           properties:
 *             isAvailable:
 *               type: boolean
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
router.get('/check-id', catchAsync(async (req, res) => { 
    let result = await userService.existLoginId(req.query.loginId);
    if (result instanceof Error) {
        res.status(result.statusCode).json({message: result.message});
    } else {
        res.status(200).json({isAvailable: !result});
    }
}));

/**
 * @swagger
 * /users/check-nickname:
 *   get:
 *     tags:
 *       - users
 *     summary: 닉네임 중복 확인
 *     description: 닉네임 중복 여부를 확인합니다.
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: nickname
 *         type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 결과 반환
 *         schema:
 *           type: object
 *           properties:
 *             isAvailable:
 *               type: boolean
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
router.get('/check-nickname', catchAsync(async (req, res) => { 
    let result = await userService.existNickname(req.query.nickname);
    if (result instanceof Error) {
        res.status(result.statusCode).json({message: result.message});
    } else {
        res.status(200).json({isAvailable: !result});
    }
}));

/**
 * @swagger
 * /users/categories:
 *   get:
 *     tags:
 *       - users
 *     summary: 카테고리 목록
 *     description: 카테고리 목록을 반환합니다.
 *     responses:
 *       200:
 *         description: 성공
 *         schema:
 *           type: array
 *           items:
 *             type: string
*/
router.get('/categories', catchAsync(async (req, res) => {
    const categories = userService.getCategories();
    res.status(200).json(categories);
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
 * /users:
 *   put:
 *     tags:
 *       - users
 *     summary: 고수 정보 수정
 *     description: 원하는 옵션을 선택적으로 사용해 고수의 정보를 수정합니다.
 *     security:
 *       - jwtCookie: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
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
 *       401:
 *         description: jwt 토큰 오류
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       500:
 *         description: 서버 오류
*/
router.put('/', upload.single('image'), catchAsync(async (req, res) => {
    let token = jwtUtil.decode(req.cookies.token);
    if (token == null) {
        return res.status(401).json({
            message: "잘못된 토큰입니다."
        })
    }
    let err = await userService.updateUser(token.id, req.body, req.file);
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
 * /users/password:
 *   patch:
 *     tags:
 *       - users
 *     summary: 비밀번호 변경
 *     description: 현재 비밀번호와 변경할 비밀번호를 입력해, 비밀번호를 변경합니다.
 *     security:
 *       - jwtCookie: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         schema:
 *           type: object
 *           required:
 *             - password
 *             - newPassword
 *           properties:
 *             password:
 *               type: string
 *             newPassword:
 *               type: string
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
 *       401:
 *         description: jwt 토큰 오류
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       500:
 *         description: 서버 오류
*/
router.patch('/password', catchAsync(async (req, res) => {
    let token = jwtUtil.decode(req.cookies.token);
    if (token == null) {
        return res.status(401).json({
            message: "잘못된 토큰입니다."
        })
    }
    let body = req.body ?? {};
    let err = await userService.updatePassword(token.id, body.password, body.newPassword);
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
 * /users:
 *   delete:
 *     tags:
 *       - users
 *     summary: 유저 삭제
 *     description: 유저를 삭제합니다. 회원을 탈퇴합니다.
 *     security:
 *       - jwtCookie: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: jwt 토큰 오류
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       404:
 *         description: 삭제할 유저 없음
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       500:
 *         description: 서버 오류
*/
router.delete('/', catchAsync(async (req, res) => {
    let token = jwtUtil.decode(req.cookies.token);
    if (token == null) {
        return res.status(401).json({
            message: "잘못된 토큰입니다."
        })
    }

    let err = await userService.deleteUser(token.id);
    if (err == null) {
        res.status(200).end();
    } else {
        res.status(err.statusCode).json({
            message: err.message
        })
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

