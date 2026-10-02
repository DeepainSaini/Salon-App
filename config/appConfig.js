require('dotenv').config();

const toNumber = (value, fallback) => {
    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? fallback : numberValue;
};

const toBoolean = (value, fallback = false) => {
    if (value === undefined) {
        return fallback;
    }

    return value === 'true';
};

const buildConfig = (env = process.env) => {
    const port = toNumber(env.PORT, 3000);

    return {
        env: env.NODE_ENV || 'development',
        server: {
            port,
            baseUrl: env.APP_BASE_URL || `http://localhost:${port}`
        },
        cors: {
            origin: env.CORS_ORIGIN || '*'
        },
        auth: {
            jwtSecret: env.JWT_SECRET_KEY,
            cookieSecure: toBoolean(env.COOKIE_SECURE, false)
        },
        database: {
            username: env.DB_USERNAME,
            password: env.DB_PASSWORD,
            name: env.DB_NAME,
            host: env.DB_HOST,
            dialect: env.DB_DIALECT || 'mysql'
        },
        email: {
            apiKey: env.SENDINBLUE_API_KEY || env.BREVO_API_KEY,
            senderEmail: env.EMAIL_SENDER_EMAIL || 'deepainsaini111@gmail.com',
            senderName: env.EMAIL_SENDER_NAME || 'Salon Appointment App'
        },
        cashfree: {
            appId: env.CASHFREE_APP_ID,
            secretKey: env.CASHFREE_SECRET_KEY,
            environment: env.CASHFREE_ENVIRONMENT || 'sandbox'
        }
    };
};

const config = buildConfig();

module.exports = {
    config,
    buildConfig
};
