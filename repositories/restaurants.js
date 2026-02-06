const connection = require('../database/mariadb'); // db connection pool

class RestaurantRepo {
    static async findAll() {
        const [rows] = await connection.query(
            'SELECT * FROM restaurants ORDER BY created_at DESC'
        );
        return rows;
    }

    static async find(kakaoId) {
        const [rows] = await connection.query(
            'SELECT * FROM restaurants WHERE kakao_place_id = ?', [kakaoId]
        );
        return rows;
    }
    
    static async findBySearch(querys) {
        let sql = "SELECT * FROM restaurants WHERE 1=1"
        if (querys.q) sql += ` AND name LIKE '%${querys.q}%'`;
        if (querys.category) sql += ` AND category = '${querys.category}'`;

        const [rows] = await connection.query(
            'SELECT * FROM restaurants WHERE id = ?', [restaurantId]
        );
        return rows;
    }
    
    static async findByKakaoId(kakaoId) {
        const [rows] = await connection.query(
            'SELECT * FROM restaurants WHERE kakao_place_id = ?', [kakaoId]
        );
        return rows[0];
    }

    static async save(restaurantData) {
        const { name, address, phone, category, x, y, kakao_id} = restaurantData;
        const [rows] = await connection.query(
            `INSERT INTO restaurants (name, address, phone_number, category, longitude, latitude, kakao_place_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, address, phone, category, x, y, kakao_id]
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
}

module.exports = RestaurantRepo;