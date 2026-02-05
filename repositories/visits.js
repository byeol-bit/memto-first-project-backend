const connection = require('../database/mariadb'); 

class VisitsRepo {
        static async save(visitData) {

        const {userId, restaurantsId, visitDate, review} = visitData
        const [rows] = await connection.query(
            `INSERT INTO visits (user_id, restaurants_id, visit_date, review) 
             VALUES (?, ?, ?, ?)`,
            [userId, restaurantsId, visitDate, review]
        );
        return rows
    }

    static async findAll() {
        const [rows] = await connection.query(
            'SELECT * FROM visits ORDER BY created_at DESC'
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
}

module.exports = VisitsRepo;