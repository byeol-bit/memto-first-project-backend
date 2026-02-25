const KakaoApi = require('../utils/kakaoApi');
const RestaurantRepo = require('../repositories/restaurants');

class RestaurantService {
    static async postRestaurants(userData) {
        const restaurant = await RestaurantRepo.save(userData);
        return restaurant
    }
    
    static async getAllRestaurants(cursor) {
        const lastId = (cursor && cursor > 0) ? parseInt(cursor) : null;
        const fetchLimit = 11;

        let sql = `
            SELECT r.*, COUNT(DISTINCT v.user_id) AS expertCount
            FROM restaurants r 
            LEFT JOIN visits v ON r.id = v.restaurant_id
        `;
        
        let params = [];

        if (lastId) {
            sql += ` WHERE r.id < ?`; 
            params.push(lastId);
        }
        
        sql += ` GROUP BY r.id ORDER BY r.id DESC LIMIT ?`;
        params.push(fetchLimit);

        const [rows] = await RestaurantRepo.findAll(sql, params);

        const hasNextPage = rows.length > 10;
        const data = hasNextPage ? rows.slice(0, 10) : rows;
        const nextCursor = hasNextPage ? data[data.length - 1].id : null;

        return {
            data,
            hasNextPage,
            nextCursor
        };
}

    static async getRestaurants(restaurantId) {
        const restaurants = await RestaurantRepo.find(restaurantId)
        return restaurants;
    }

    static async getBySearch(querys) {
        let sql = "SELECT * FROM restaurants WHERE 1=1"
        if (querys.q) sql += ` AND name LIKE '%${querys.q}%'`;
        if (querys.category) sql += ` AND category = '${querys.category}'`;

        const restaurants = await RestaurantRepo.findBySearch(sql);
        return restaurants;
    }
    static async searchKakao(query) {
        const results = await KakaoApi.search(query);
    
        const formattedResults = results.documents.map(place => ({
            kakao_id: place.id,
            name: place.place_name,
            address: place.address_name,
            phone: place.phone,
            category: place.category_group_name,
            x: place.x,
            y: place.y
    }));   
        return formattedResults;
    }

    static async toggleLike(userId, restaurantId, isLike) {
        if (isLike) {
            await RestaurantRepo.addLike(userId, restaurantId);
        } else {
            await RestaurantRepo.removeLike(userId, restaurantId);
        }
    }

    static async getLikeStatus(userId, restaurantId) {
        return await RestaurantRepo.checkLike(userId, restaurantId);
    }

    static async getRestaurantRanking(limit) {
        return await RestaurantRepo.findRestaurantRanking(limit);
    }
}

module.exports = RestaurantService;