const assert = require('assert');
const { buildConfig } = require('../config/appConfig');

const config = buildConfig({
    NODE_ENV: 'test',
    PORT: '5000',
    APP_BASE_URL: 'http://localhost:5000',
    CORS_ORIGIN: 'http://localhost:5000',
    JWT_SECRET_KEY: 'test-secret',
    DB_USERNAME: 'root',
    DB_PASSWORD: 'password',
    DB_NAME: 'salon_test',
    DB_HOST: 'localhost',
    DB_DIALECT: 'mysql',
    SENDINBLUE_API_KEY: 'email-key',
    EMAIL_SENDER_EMAIL: 'sender@example.com',
    EMAIL_SENDER_NAME: 'Salon Test',
    CASHFREE_APP_ID: 'cashfree-id',
    CASHFREE_SECRET_KEY: 'cashfree-secret',
    CASHFREE_ENVIRONMENT: 'sandbox',
    COOKIE_SECURE: 'true'
});

assert.strictEqual(config.env, 'test');
assert.strictEqual(config.server.port, 5000);
assert.strictEqual(config.server.baseUrl, 'http://localhost:5000');
assert.strictEqual(config.cors.origin, 'http://localhost:5000');
assert.strictEqual(config.auth.jwtSecret, 'test-secret');
assert.strictEqual(config.auth.cookieSecure, true);
assert.strictEqual(config.database.name, 'salon_test');
assert.strictEqual(config.email.apiKey, 'email-key');
assert.strictEqual(config.email.senderEmail, 'sender@example.com');
assert.strictEqual(config.cashfree.environment, 'sandbox');

const defaultConfig = buildConfig({});
assert.strictEqual(defaultConfig.env, 'development');
assert.strictEqual(defaultConfig.server.port, 3000);
assert.strictEqual(defaultConfig.server.baseUrl, 'http://localhost:3000');
assert.strictEqual(defaultConfig.database.dialect, 'mysql');
assert.strictEqual(defaultConfig.auth.cookieSecure, false);

console.log('app config tests passed');
