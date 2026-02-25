const VisitRepo = require('../repositories/visits');

class VisitService {
    static async postVisits(visitsData) {
        const visits = await VisitRepo.save(visitsData);
        return visits
    }
    
    static async getAllVisit(cursor) {
        const lastId = (cursor && cursor > 0) ? parseInt(cursor) : null;
        const fetchLimit = 11;

        let sql = `
            SELECT 
            v.*, 
            r.name AS r_name, r.address AS r_address, r.phone_number AS r_phone_number,
            r.category AS r_category, r.latitude AS r_latitude, r.longitude AS r_longitude,
            r.kakao_place_id AS r_kakao_place_id, r.created_at AS r_created_at, r.updated_at AS r_updated_at,
            u.nickname AS u_nickname, u.profile_image AS u_profile_image, 
            u.introduction AS u_introduction, u.category AS u_category
            FROM visits v 
            JOIN restaurants r ON v.restaurant_id = r.id 
            JOIN users u ON v.user_id = u.id
            `
        let params = [];

        if (lastId) {
            sql += ` WHERE v.id < ?`; 
            params.push(lastId);
        }
        
        sql += ` GROUP BY v.id ORDER BY v.id DESC LIMIT ?`;
        params.push(fetchLimit);

        const rows = await VisitRepo.findAll(sql, params);

        const hasNextPage = rows.length > 10;
        const data = hasNextPage ? rows.slice(0, 10) : rows;
        const nextCursor = hasNextPage ? data[data.length - 1].id : null;

        return {
            data,
            hasNextPage,
            nextCursor
        };
    }

    static async getVisitByUser(userId) {
        const visits = await VisitRepo.findVisitByUser(userId);
        return visits;
    }

    static async getVisitByRestaurant(restaurantId) {
        const visits = await VisitRepo.findVisitByRestaurant(restaurantId);
        return visits;
    }

    static async toggleLike(userId, visitId, isLike) {
        if (isLike) {
            await VisitRepo.addLike(userId, visitId);
        } else {
            await VisitRepo.removeLike(userId, visitId);
        }
}

    static async getLikeStatus(userId, visitId) {
        return await VisitRepo.checkLike(userId, visitId);
    }

    static async getFollowingVisits(userId) {
        return await VisitRepo.getVisitsByFollowing(userId);
    }

//     static async searchPlaces(query) {
//     const results = await KakaoApi.search(query);
    
//     const formattedResults = results.documents.map(place => ({
//         kakao_id: place.id,
//         name: place.place_name,
//         address: place.address_name,
//         phone: place.phone,
//         category: place.category_group_name,
//         x: place.x,
//         y: place.y
//     }));   
//     return formattedResults;
// }




}

module.exports = VisitService;