const assert = require('assert');
const { timeToMinutes, minutesToTime } = require('../util/timeHelpers');

assert.strictEqual(timeToMinutes('10:30'), 630);
assert.strictEqual(timeToMinutes('09:05:00'), 545);
assert.strictEqual(minutesToTime(630), '10:30');
assert.strictEqual(minutesToTime(545), '09:05');

console.log('timeHelpers tests passed');
