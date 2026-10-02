const assert = require('assert');
const { successResponse, errorResponse } = require('../util/apiResponse');
const {
    requireFields,
    requireArrayField,
    requireRatingRange,
    requireParams,
    requireQuery,
    requireStrongPassword
} = require('../middlewares/validateRequest');

function createMockResponse() {
    return {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        }
    };
}

{
    const res = createMockResponse();
    successResponse(res, 201, 'created', { id: 1 });

    assert.strictEqual(res.statusCode, 201);
    assert.deepStrictEqual(res.body, {
        success: true,
        message: 'created',
        data: { id: 1 }
    });
}

{
    const res = createMockResponse();
    errorResponse(res, 400, 'name is required');

    assert.strictEqual(res.statusCode, 400);
    assert.deepStrictEqual(res.body, {
        success: false,
        message: 'name is required'
    });
}

{
    const middleware = requireFields(['email', 'password']);
    const res = createMockResponse();
    let nextCalled = false;

    middleware({ body: { email: 'test@example.com' } }, res, () => {
        nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, 'password is required');
}

{
    const middleware = requireFields(['email', 'password']);
    const res = createMockResponse();
    let nextCalled = false;

    middleware({ body: { email: 'test@example.com', password: 'secret' } }, res, () => {
        nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(res.statusCode, null);
}

{
    const middleware = requireArrayField('serviceIds');
    const res = createMockResponse();
    let nextCalled = false;

    middleware({ body: { serviceIds: [] } }, res, () => {
        nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.message, 'serviceIds must contain at least one value');
}

{
    const middleware = requireRatingRange('rating');
    const res = createMockResponse();
    let nextCalled = false;

    middleware({ body: { rating: 6 } }, res, () => {
        nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.message, 'Rating must be between 1 and 5');
}

{
    const middleware = requireParams(['id']);
    const res = createMockResponse();
    let nextCalled = false;

    middleware({ params: {} }, res, () => {
        nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.message, 'id param is required');
}

{
    const middleware = requireQuery(['salonId', 'serviceId', 'date']);
    const res = createMockResponse();
    let nextCalled = false;

    middleware({ query: { salonId: '1', serviceId: '2' } }, res, () => {
        nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.message, 'date query is required');
}

{
    const middleware = requireStrongPassword('password');
    const res = createMockResponse();
    let nextCalled = false;

    middleware({ body: { password: 'weak' } }, res, () => {
        nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.message, 'Password must be at least 8 characters long');
}

{
    const middleware = requireStrongPassword('password');
    const res = createMockResponse();
    let nextCalled = false;

    middleware({ body: { password: 'Strong123' } }, res, () => {
        nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(res.statusCode, null);
}

console.log('validation and response tests passed');
