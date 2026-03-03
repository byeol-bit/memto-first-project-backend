const VisitRepo = require('../repositories/visits');

class VisitService {
    static async postVisits(visitsData) {
        const visits = await VisitRepo.save(visitsData);
        return visits
    }
    
    static async getAllVisit(cursor) {
        const lastId = (cursor && cursor > 0) ? parseInt(cursor) : null;
        const fetchLimit = 11;

        const rows = await VisitRepo.findAll(lastId, fetchLimit);

        const hasNextPage = rows.length > 10;
        const data = hasNextPage ? rows.slice(0, 10) : rows;
        const nextCursor = hasNextPage ? data[data.length - 1].id : null;

        return {
            data,
            hasNextPage,
            nextCursor
        };
    }

    static async getVisitByUser(userId, cursor) {
        const lastId = (cursor && cursor > 0) ? parseInt(cursor) : null;
        const fetchLimit = 11;

        const rows = await VisitRepo.findVisitByUser(userId, lastId, fetchLimit);

        const hasNextPage = rows.length > 10;
        const data = hasNextPage ? rows.slice(0, 10) : rows;
        const nextCursor = hasNextPage ? data[data.length - 1].id : null;

        return {
            data,
            hasNextPage,
            nextCursor
        };
    }

    static async getVisitByRestaurant(restaurantId, cursor) {
        const lastId = (cursor && cursor > 0) ? parseInt(cursor) : null;
        const fetchLimit = 11;

        const rows = await VisitRepo.findVisitByRestaurant(restaurantId, lastId, fetchLimit);

        const hasNextPage = rows.length > 10;
        const data = hasNextPage ? rows.slice(0, 10) : rows;
        const nextCursor = hasNextPage ? data[data.length - 1].id : null;

        return {
            data,
            hasNextPage,
            nextCursor
        };
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