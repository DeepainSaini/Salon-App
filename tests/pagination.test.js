const assert = require('assert');
const { getPagination, getPaginationMeta } = require('../util/pagination');

{
    const pagination = getPagination({ page: '2', limit: '10' });

    assert.deepStrictEqual(pagination, {
        page: 2,
        limit: 10,
        offset: 10
    });
}

{
    const pagination = getPagination({ page: '-5', limit: '1000' });

    assert.strictEqual(pagination.page, 1);
    assert.strictEqual(pagination.limit, 50);
    assert.strictEqual(pagination.offset, 0);
}

{
    const pagination = getPagination(
        {
            servicePage: '3',
            serviceLimit: '5'
        },
        {
            pageKey: 'servicePage',
            limitKey: 'serviceLimit'
        }
    );

    assert.deepStrictEqual(pagination, {
        page: 3,
        limit: 5,
        offset: 10
    });
}

{
    const meta = getPaginationMeta(25, 2, 10);

    assert.deepStrictEqual(meta, {
        totalItems: 25,
        currentPage: 2,
        totalPages: 3,
        limit: 10
    });
}

console.log('pagination tests passed');
