const express = require('express');
const cors = require('cors');
const db = require('./models');
const cookieParser = require('cookie-parser');
const customerRoutes = require('./routes/customerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const profileRoutes = require('./routes/profileRoutes');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const passwordRoutes = require('./routes/passwordRoutes');
const staffRoutes = require('./routes/staffRoutes');
const { startReminderCron } = require('./jobs/reminderEmailCronJob');
const errorHandler = require('./middlewares/errorHandler');
const { config } = require('./config/appConfig');
const helmet  = require('helmet')
const { apiLimiter } = require('./middlewares/rateLimiter');
const { connectRedis } = require('./util/redisClient');
const logger = require('./util/logger');
const compression = require('compression');


const app = express();

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        scriptSrc: ["'self'", "https://sdk.cashfree.com"],

        connectSrc: [
          "'self'",
          "https://sdk.cashfree.com",
          "https://sandbox.cashfree.com",
          "https://api.cashfree.com"
        ],

        frameSrc: [
          "'self'",
          "https://sdk.cashfree.com",
          "https://sandbox.cashfree.com",
          "https://payments.cashfree.com"
        ],

        formAction: [
          "'self'",
          "https://sandbox.cashfree.com",
          "https://payments.cashfree.com"
        ],

        imgSrc: ["'self'", "data:"],

        styleSrc: ["'self'", "'unsafe-inline'"]
      }
    }
  })
);
app.use(compression());
app.use(apiLimiter)
app.use(cors({
    origin: config.cors.origin,
    credentials: true
}));

app.use('/user',authRoutes);
app.use('/user',customerRoutes);
app.use('/admin',adminRoutes);
app.use('/user',profileRoutes);
app.use('/user',bookingRoutes);
app.use('/user',reviewRoutes);
app.use('/payment', paymentRoutes);
app.use('/user', passwordRoutes);
app.use('/staff', staffRoutes);
app.use(express.static('public'));
app.use(errorHandler);




db.sequelize.authenticate().then(async (result)=>{
    
    await connectRedis();  
    startReminderCron();

    app.listen(config.server.port,(err)=>{

        logger.info(`SERVER IS RUNNING ON PORT ${config.server.port}`);
        
    });

}).catch((error)=>{

    logger.error('DATABASE CONNECTION ERROR', { error: error.message });
})
