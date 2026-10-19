const getPagination = (query, options = {}) => {
    const pageKey = options.pageKey || 'page';
    const limitKey = options.limitKey || 'limit';

    const page = Math.max(Number(query[pageKey]) || 1, 1);
    const limit = Math.min(Math.max(Number(query[limitKey]) || 10, 1), 50);
    const offset = (page - 1) * limit;

    return {
        page,
        limit,
        offset
    };
};

const getPaginationMeta = (count, page, limit) => {
    return {
        totalItems: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        limit
    };
};

module.exports = {
    getPagination,
    getPaginationMeta
};
