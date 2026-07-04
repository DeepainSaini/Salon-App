const express = require('express');
const cors = require('cors');
const db = require('./models');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const { startReminderCron } = require('./jobs/reminderEmailCronJob');


const app = express();

app.use(express.json());
app.use(cookieParser());



app.use('/user',userRoutes);
app.use('/admin',adminRoutes);
app.use('/payment', paymentRoutes);
app.use(express.static('public'));

app.use(cors({
    origin: '*'
}));


db.sequelize.authenticate().then((result)=>{
    
    startReminderCron();

    app.listen(3000,(err)=>{

        console.log("SERVER IS RUNNING");
        
    });

}).catch((error)=>{

    console.log(error);
})
