const VisitRepo = require('../repositories/visits');

class VisitService {
    static async postVisits(visitsData) {
        const visits = await VisitRepo.save(visitsData);
        return visits
    }
    
    static async getAllVisits() {
        const visits = await VisitRepo.findAll();
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