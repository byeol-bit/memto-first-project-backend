const CATEGORIES = [
    '길 잃은 미식가',
    '쩝쩝 학부생',
    '동네 탐구 석사',
    '맛집 개척 교수',
    '맛집 총장'
];

/**
 * @param {number} reviewCount
 * @returns {string}
 */
function getCategory(reviewCount) {
    if (reviewCount < 2) {
        return CATEGORIES[0];
    } else if (reviewCount < 4) {
        return CATEGORIES[1];
    } else if (reviewCount < 6) {
        return CATEGORIES[2];
    } else if (reviewCount < 8) {
        return CATEGORIES[3];
    } else {
        return CATEGORIES[4];
    }
}

module.exports = {
    CATEGORIES,
    getCategory
}