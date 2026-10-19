const assert = require('assert');
const modelsPath = require.resolve('../models');
const availabilityServicePath = require.resolve('../util/services/availabilityService');

delete require.cache[modelsPath];
delete require.cache[availabilityServicePath];

require.cache[modelsPath] = {
    id: modelsPath,
    filename: modelsPath,
    loaded: true,
    exports: {
        Services: {
            findOne: async () => ({
                id: 1,
                duration: 30,
                available_from: '10:00:00',
                available_to: '11:30:00'
            })
        },
        Staff: {
            findAll: async () => ([
                {
                    id: 1,
                    name: 'Test Staff',
                    available_from: '10:00:00',
                    available_to: '11:30:00'
                }
            ])
        },
        Appointments: {
            findAll: async () => []
        },
        BookedSlots: {
            findAll: async () => ([
                {
                    staffId: 1,
                    start_time: '10:15:00',
                    end_time: '10:45:00'
                }
            ])
        }
    }
};

const availabilityService = require('../util/services/availabilityService');

(async () => {
    assert.strictEqual(typeof availabilityService.getAvailableSlotsForService, 'function');

    const result = await availabilityService.getAvailableSlotsForService({
        salonId: 1,
        serviceId: 1,
        date: '2099-01-01'
    });

    assert.deepStrictEqual(result.slots, [
        {
            time: '11:00',
            staffId: 1,
            staffName: 'Test Staff'
        }
    ]);

    console.log('availabilityService tests passed');
})();
