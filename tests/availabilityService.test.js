const assert = require('assert');
const availabilityService = require('../util/services/availabilityService');

assert.strictEqual(typeof availabilityService.getAvailableSlotsForService, 'function');

console.log('availabilityService tests passed');
