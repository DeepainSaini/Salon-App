const assert = require('assert');
const asyncHandler = require('../util/asyncHandler');
const errorHandler = require('../middlewares/errorHandler');

assert.strictEqual(typeof asyncHandler, 'function');
assert.strictEqual(typeof errorHandler, 'function');

console.log('error helper tests passed');
