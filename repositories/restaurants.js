const connection = require('../database/mariadb'); // db connection pool

class RestaurantRepo {
    static async find(restaurant_id) {
        const [rows] = await connection.query(
            'SELECT * FROM restaurants WHERE id = ? ORDER BY created_at DESC', [restaurant_id]
        );
        return rows;
    }

    static async findAll(sql, params) {
        const [rows] = await connection.query(sql, params);
        return rows;
    }

    static async find(restaurantId) {
        let queryId = parseInt(restaurantId)
        const [rows] = await connection.query(
            'SELECT * FROM restaurants WHERE id = ?', [queryId]
        );
        return rows;
    }
    
    static async findBySearch(querys) {
        const [rows] = await connection.query(querys)
        return rows;
    }
    
    static async findByKakaoId(kakaoId) {
        let queryId = parseInt(kakaoId)
        const [rows] = await connection.query(
            'SELECT * FROM restaurants WHERE kakao_place_id = ?', [queryId]
        );
        return rows[0];
    }

    static async save(restaurantData) {
        const { name, address, phone_number, category, longitude, latitude, kakao_place_id} = restaurantData;
        const [rows] = await connection.query(
            `INSERT INTO restaurants (name, address, phone_number, category, longitude, latitude, kakao_place_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, address, phone_number, category, longitude, latitude, kakao_place_id]
        );
        return rows
    }

    static async checkLike(userId, restaurantId) {
        const [rows] = await connection.query(
            'SELECT * FROM restaurant_likes WHERE user_id = ? AND restaurant_id = ?',
            [userId, restaurantId]
        );
        return rows.length > 0;
    }

    static async addLike(userId, restaurantId) {
        return await connection.query('INSERT INTO restaurant_likes (user_id, restaurant_id) VALUES (?, ?)', [userId, restaurantId]);
    }

    static async removeLike(userId, restaurantId) {
        return await connection.query('DELETE FROM restaurant_likes WHERE user_id = ? AND restaurant_id = ?', [userId, restaurantId]);
    }

    static async findRestaurantRanking(limit) {

        const queryLimit = parseInt(limit) || 5;
        const [rows] = await connection.query(`SELECT r.*, COUNT(v.id) AS review_count FROM restaurants r JOIN visits v ON r.id = v.restaurant_id
            GROUP BY r.id ORDER BY review_count DESC LIMIT ?`, [queryLimit]);
        return rows
    }
}

module.exports = RestaurantRepo;