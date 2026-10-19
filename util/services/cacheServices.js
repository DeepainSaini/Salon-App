const { redisClient } = require('../redisClient');
const logger = require('../logger');

const getCache = async (key) => {
    try {
        if (!redisClient.isOpen) {
            return null;
        }

        const cachedData = await redisClient.get(key);

        if (!cachedData) {
            return null;
        }

        return JSON.parse(cachedData);
    } catch (error) {
        logger.error('CACHE GET ERROR', { key, error: error.message });
        return null;
    }
};

const setCache = async (key, data, ttlInSeconds = 300) => {
    try {
        if (!redisClient.isOpen) {
            return;
        }

        await redisClient.setEx(key, ttlInSeconds, JSON.stringify(data));
    } catch (error) {
        logger.error('CACHE SET ERROR', { key, error: error.message });
    }
};

const deleteCache = async (key) => {
    try {
        if (!redisClient.isOpen) {
            return;
        }

        await redisClient.del(key);
    } catch (error) {
        logger.error('CACHE DELETE ERROR', { key, error: error.message });
    }
};

const deleteCacheByPattern = async (pattern) => {
    try {
        if (!redisClient.isOpen) {
            return;
        }

        const keys = [];

        for await (const key of redisClient.scanIterator({
            MATCH: pattern,
            COUNT: 100
        })) {
            keys.push(key);
        }

        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    } catch (error) {
        logger.error('CACHE PATTERN DELETE ERROR', { pattern, error: error.message });
    }
};

module.exports = {
    getCache,
    setCache,
    deleteCache,
    deleteCacheByPattern
};
