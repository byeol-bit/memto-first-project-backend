const KakaoApi = require('../utils/kakaoApi');
const RestaurantRepo = require('../repositories/restaurants');

class RestaurantService {
    static async postRestaurants(userData) {
        const restaurant = await RestaurantRepo.save(userData);
        return restaurant
    }
    
    static async getAllRestaurants() {
        const restaurants = await RestaurantRepo.findAll();
        return restaurants;
    }

    static async getRestaurants(restaurantId) {
        const restaurants = await RestaurantRepo.find(restaurantId)
        return restaurants;
    }

    static async getBySearch(querys) {
        let sql = "SELECT * FROM restaurants WHERE 1=1"
        if (querys.q) sql += ` AND name LIKE '%${querys.q}%'`;
        if (querys.category) sql += ` AND category = '${querys.category}'`;

        const restaruants = await RestaurantRepo.search
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
}

module.exports = RestaurantService;