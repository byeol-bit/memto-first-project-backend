# 숨은 맛집고수 — Backend

맛집 방문을 기록하고, 유저끼리 팔로우하며, 팔로우한 사람들의 리뷰를 피드로 보는 소셜 서비스의 백엔드입니다.

프론트엔드 링크: [memto-first-project-frontend](https://github.com/byeol-bit/memto-first-project-frontend)

API 개요: [Swagger UI](https://hidden-master-server.fly.dev/api)

데이터베이스 스키마: [database/init.sql](https://github.com/byeol-bit/memto-first-project-backend/blob/main/database/init.sql)

---

## 기술 스택

| 구분 | 사용 기술 |
|---|---|
| Runtime / Framework | Node.js, Express 5 |
| Database | MySQL (mysql2, raw SQL) |
| 인증 | JWT(jsonwebtoken), bcryptjs, cookie-parser |
| 이미지 | multer, sharp |
| API 문서 | Swagger (swagger-jsdoc, swagger-ui-express) |
| 외부 연동 | Kakao API |
| 배포 | Docker, fly.io |

---

## 아키텍처

```
src
├── routes/          # HTTP 요청 라우팅
├── services/        # 비즈니스 로직
├── repositories/    # DB 접근 (SQL)
├── utils/           # 공통 유틸 (인증, 이미지, 에러 처리 등)
├── database/        # DB 커넥션 및 스키마
├── swagger.js       # API 문서 설정
└── server.js        # 앱 엔트리포인트
```

---

## 실행 방법

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정 (.env)
cp .env.example .env
# DB 접속 정보, JWT_KEY, KAKAO_REST_API_KEY 등을 채웁니다

# 3. 데이터베이스 스키마 생성
# database/init.sql 을 MySQL에 적용

# 4. 서버 실행
npm start
```

---

## 환경 변수

| 변수 | 설명 |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL 접속 정보 |
| `JWT_KEY` | JWT 서명 키 |
| `KAKAO_REST_API_KEY` | Kakao API 키 |
| `PORT` | 서버 포트 |


---

## 팀원 소개

| 프로필 | 이름 | 역할 | GitHub |
|--------|------|------|--------|
| <img src="https://github.com/gunyoung5.png" width="50" /> | 장건영 | restaurants, visits 기능 | [@gunyoung5](https://github.com/gunyoung5) |
| <img src="https://github.com/s576air.png" width="50" /> | 한재민 | follows, users 기능 | [@s576air](http://github.com/s576air) |
