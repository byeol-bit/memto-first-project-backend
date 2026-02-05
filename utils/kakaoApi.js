// utils/kakaoApi.js
require('dotenv').config();
const axios = require('axios');
const kakaoInstance = axios.create({
    baseURL: 'https://dapi.kakao.com/v2/local',
    headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` }
});

class KakaoApi {
    static async search(query) {
        const response = await kakaoInstance.get('/search/keyword.json', { params: { query } });
        return response.data;
    }
}
module.exports = KakaoApi;
