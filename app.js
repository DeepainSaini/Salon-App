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


const app = express();

app.use(cors({
    origin: '*'
}));

app.use(express.json());
app.use(cookieParser());


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




db.sequelize.authenticate().then((result)=>{
    
    startReminderCron();

    app.listen(3000,(err)=>{

        console.log("SERVER IS RUNNING");
        
    });

}).catch((error)=>{

    console.log(error);
})
