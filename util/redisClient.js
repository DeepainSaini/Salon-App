const { createClient } = require('redis');
const { config } = require('../config/appConfig');
const logger = require('./logger');

const redisClient = createClient({
  url: config.redis.url
});

redisClient.on('error', (error) => {
  logger.error('REDIS ERROR', { error: error.message });
});

const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    logger.info('REDIS CONNECTED');
  }
};

module.exports = {
  redisClient,
  connectRedis
};
