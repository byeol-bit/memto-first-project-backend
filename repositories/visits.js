const connection = require('../database/mariadb'); 

class VisitsRepo {
        static async save(visitData) {

        const {userId, restaurantId, visitDate, review} = visitData
        const [rows] = await connection.query(
            `INSERT INTO visits (user_id, restaurant_id, visit_date, review) 
             VALUES (?, ?, ?, ?)`,
            [userId, restaurantId, visitDate, review]
        );
        return rows
    }

    static async findAll() {
        const [rows] = await connection.query(
            'SELECT * FROM visits ORDER BY created_at DESC'
        );
        return rows;
    }
    
    static async findVisitByUser(userId) {
        let queryId = parseInt(userId)
        const [rows] = await connection.query(
            'SELECT * FROM visits WHERE user_id = ?', [queryId]
        );
        return rows;
    }

    static async findVisitByRestaurant(restaurantId) {
        let queryId = parseInt(restaurantId)
        const [rows] = await connection.query(
            'SELECT * FROM visits WHERE restaurant_id = ?', [queryId]
        );
        return rows;
    }

    static async addLike(userId, visitId) {
        return await connection.query('INSERT INTO visit_likes (user_id, visit_id) VALUES (?, ?)', [userId, visitId]);
    }

    static async removeLike(userId, visitId) {
        return await connection.query('DELETE FROM visit_likes WHERE user_id = ? AND visit_id = ?', [userId, visitId]);
    }

    static async checkLike(userId, visitId) {
        const [rows] = await connection.query(
            'SELECT * FROM visit_likes WHERE user_id = ? AND visit_id = ?',
            [userId, visitId]
        );
        return rows.length > 0;
    }

    static async getVisitsByFollowing(userId) {
        const sql = `
        SELECT * FROM visits
        WHERE user_id IN (SELECT following_id FROM follows WHERE follower_id = ?)
        ORDER BY created_at DESC;`;
        const [rows] = await connection.query(sql, userId);
        return rows;
    }
}

module.exports = VisitsRepo;