/**
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
    const yy = String(date.getFullYear()).slice(2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
}

module.exports.formatDate = formatDate;