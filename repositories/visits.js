const connection = require('../database/mariadb'); 

class VisitsRepo {

    static formatVisit(rows) {
        const { r_name, r_address, r_phone_number, r_category, r_latitude, r_longitude, r_kakao_place_id,
            r_created_at, r_updated_at, u_nickname, u_profile_image, u_introduction, u_category, ...visitData } = rows;
        return { 
            ...visitData,
            restaurant: {
                name: r_name,
                address: r_address,
                phone_number: r_phone_number,
                category: r_category,
                latitude: r_latitude,
                longtitde: r_longitude,
                kakao_place_id: r_kakao_place_id,
                created_at: r_created_at,
                updated_at: r_updated_at
            },
            user: {
                nickname: u_nickname,
                profile_image: u_profile_image,
                introduction: u_introduction,
                category: u_category
            }
        }
    }

    static async save(visitData) {
        const {userId, restaurantId, visitDate, review} = visitData
        const [rows] = await connection.query(
            `INSERT INTO visits (user_id, restaurant_id, visit_date, review) 
             VALUES (?, ?, ?, ?)`,
            [userId, restaurantId, visitDate, review]
        )

        console.log(rows)
        const [result] = await connection.query(
            `SELECT * FROM visits WHERE id = ?`, [rows.insertId]
        )
    
        return result
    }

    static async findAll(sql, params) {
        const [rows] = await connection.query(sql, params);
        return rows.map(this.formatVisit);
    }
    
    static async findVisitByUser(userId) {
        let queryId = parseInt(userId)
        const [rows] = await connection.query(
            `SELECT v.*, r.name AS r_name, r.address AS r_address, r.phone_number AS r_phone_number,
            r.category AS r_category, r.latitude AS r_latitude, r.longitude AS r_longitude,
            r.kakao_place_id AS r_kakao_place_id, r.created_at AS r_created_at, r.updated_at AS r_updated_at
            FROM visits v JOIN restaurants r ON v.restaurant_id = r.id WHERE user_id = ? ORDER BY v.created_at DESC`, [queryId]
        );
        return rows.map(this.formatVisit);
    }

    static async findVisitByRestaurant(restaurantId) {
        let queryId = parseInt(restaurantId)
        const rows = await connection.query(
            `SELECT v.*, r.name AS r_name, r.address AS r_address, r.phone_number AS r_phone_number,
            r.category AS r_category, r.latitude AS r_latitude, r.longitude AS r_longitude,
            r.kakao_place_id AS r_kakao_place_id, r.created_at AS r_created_at, r.updated_at AS r_updated_at
            FROM visits v JOIN restaurants r ON v.restaurant_id = r.id WHERE restaurant_id = ? ORDER BY v.created_at DESC`, [queryId]
        );
        return rows.map(this.formatVisit);
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