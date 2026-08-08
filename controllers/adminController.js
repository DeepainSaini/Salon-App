const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {Users,Salons,Services,Staff,Appointments,Reviews,StaffServices,Invoice} = require('../models');
const {Sequelize,DataTypes, where,Op} = require('sequelize');
const { sequelize } = require('../models');
const { generateInvoicePdf } = require('../util/services/invoiceService');

const getAdminDetailsForm = async (req,res) => {
    res.sendFile(path.join(__dirname,'../','views','salonDetails.html'));
}

const getAdminDashboard = async (req,res) => {
    res.sendFile(path.join(__dirname,'../','views','adminDashboard.html'));
}

const getAdminDashboardData = async (req,res) => {
    try {
        const salon = await Salons.findOne({
                            where: {
                                adminId: req.user.id
                            },
                            include: [
                                {
                                    model: Services,
                                    as: 'services'
                                },
                                {
                                    model: Staff,
                                    as: 'staff',
                                    include: [
                                        {
                                            model: Services,
                                            as: 'services'
                                        }
                                    ]
                                }
                            ]
                       });

        if(!salon){
            return res.status(404).json({message:"salon details not found"});
        }

        const appointments = await Appointments.findAll({
            where: {
                salonId: salon.id,
                status: {
                    [Op.in]: ['booked', 'completed', 'cancelled']
                },
                paymentStatus: 'paid'
            },
            include: [
                { model: Users, as: 'customer' },
                { model: Services, as: 'service' },
                { model: Staff, as: 'staff' },
                { model: Reviews, as: 'review', required: false},
                { model: Invoice, as: 'invoice', required: false }
            ],
            order: [['appointment_date', 'ASC'], ['appointment_time', 'ASC']]
        });

        console.log("SERVICE ------->>>>>>>",salon.services);

        return res.status(200).json({
            salon: salon,
            services: salon.services || [],
            staff: salon.staff,
            appointments
        });

    } catch (error) {
        console.error("ERROR WHILE LOADING ADMIN DASHBOARD DATA ---> ",error);
        return res.status(500).json({message:"something went wrong"});
    }
}

const postSalonDetails = async (req,res) => {
    
    const t = await sequelize.transaction();
    console.log("SALON DETAILS ------> ",req.body);

    try {
        
        const {name,description,email,address,zipcode,city,phone,open_time,close_time} = req.body;

        const newSalon = await Salons.create({
            name: name,
            description: description,
            email: email,
            address: address,
            zip_code: zipcode,
            city: city,
            phone: phone,
            open_time: open_time,
            close_time: close_time,
            adminId: req.user.id 
        }, { transaction: t });

         await t.commit();

        return res.status(201).json({
            success: true,
            message: "Onboarding complete! Your salon profile and menu are active."
        });

    } catch (error) {
        await t.rollback();
        console.error("CRITICAL ONBOARDING ERROR in admincontroller:", error);
        return res.status(500).json({ message: "Internal server error during Posting salon details." });
    }
    
}

const getAddServiceForm =  (req,res) => {
    res.sendFile(path.join(__dirname,'../','views','addServices.html'));
}

const postAddedService = async (req,res) => {

    const t = await sequelize.transaction();
    console.log("SERVICE TO ADD -------> ",req.body);

    try{

        const {name,description,price,duration,available_from, available_to} = req.body;

        const salon = await Salons.findOne({
            where: {
                adminId: req.user.id
            }
        });

        if (!salon) {
            return res.status(404).json({
                message: "Please create salon details first"
            });
        }

        const salonOpen = salon.open_time.slice(0, 5);
        const salonClose = salon.close_time.slice(0, 5);

        if (available_from &&available_to &&(available_from < salonOpen || available_to > salonClose)) 
        {
            return res.status(400).json({
                message: "Service availability must be inside salon working hours"
            });
        }

        const newService = await Services.create({
            name: name,
            description: description,
            price: price,
            duration: duration,
            available_from: available_from,
            available_to: available_to,
            salonId: salon.id 
        }, { transaction: t });

        await t.commit();

        res.status(201).json({
            message: "Service added successfully"
        });

    }catch(error){

        console.log("ERROR ADDING SERVICE ---> ", error);
        await t.rollback();
        res.status(500).json({
            message: "something went wrong"
        });
    }
}

const changeServiceStatus = async (req,res) => {

    const t = await sequelize.transaction();
    
    try{

        const serviceId = req.params.id;
         const salon = await Salons.findOne({
            where: {
                adminId: req.user.id
            }
        });

        if (!salon) {
            return res.status(404).json({
                message: "salon not found"
            });
        }

        const service = await Services.findOne({
            where: {
                id: serviceId,
                salonId: salon.id   // always add salonId so that other admin can't change other service 
            }
        });

        if (!service) {
            return res.status(404).json({
                message: "service not found"
            });
        }

        service.is_active = !service.is_active;

        await service.save({transaction : t});
        await t.commit();

        res.status(200).json({
            message: "service status updated",
            is_active: service.is_active
        });

    } catch (error) {
        console.log("ERROR UPDATING SERVICE STATUS ---> ", error);
        await t.rollback();
        res.status(500).json({
            message: "something went wrong"
        });
    }
    
};

const getAddStaffForm =  (req,res) => {
    res.sendFile(path.join(__dirname,'../','views','addStaff.html'));
}

const getDataForStaffForm = async (req, res) => {
    
    try {
        const salon = await Salons.findOne({
            where: {
                adminId: req.user.id
            }
        });

        if (!salon) {
            return res.status(404).json({
                message: "salon not found"
            });
        }

        const services = await Services.findAll({
            where: {
                salonId: salon.id,
                is_active: true
            }
        });

        res.status(200).json({
            salon: {
                open_time: salon.open_time,
                close_time: salon.close_time
            },
            services: services
        });

    } catch (error) {
        console.log("ERROR GETTING SERVICES FOR STAFF FORM ---> ", error);
        res.status(500).json({
            message: "something went wrong"
        });
    }
};

const postAddStaff = async (req, res) => {
    
    const t = await sequelize.transaction();
    try {
        const { name, phone, email, specialization, available_from, available_to, serviceIds, password } = req.body;
        
        if (!serviceIds || serviceIds.length === 0) {
            return res.status(400).json({
                message: "Please assign at least one service"
            });
        }
        const salon = await Salons.findOne({
            where: {
                adminId: req.user.id
            }
        });

        if (!salon) {
            return res.status(404).json({
                message: "salon not found"
            });
        }

        const services = await Services.findAll({
            where: {
                id: {
                [Op.in]: serviceIds
                },
                salonId: salon.id,
                is_active: true
            }
        });

        if (services.length !== serviceIds.length) {
            return res.status(400).json({
                message: "Invalid service selected"
            });
        }

        if (!services) {
            return res.status(404).json({
                message: "services not found for your salon"
            });
        }

        const salonOpen = salon.open_time.slice(0, 5);
        const salonClose = salon.close_time.slice(0, 5);

        if (available_from >= available_to) {
            return res.status(400).json({
                message: "Available from must be before available to"
            });
        }

        if (available_from < salonOpen || available_to > salonClose) {
            return res.status(400).json({
                message: "Staff availability must be inside salon working hours"
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const staff = await Staff.create({
            name: name,
            phone: phone,
            email: email,
            password: hashedPassword,
            specialization: specialization,
            available_from: available_from,
            available_to: available_to,
            salonId: salon.id,
            serviceId: serviceIds[0]
        },{transaction: t});

        const staffServiceRows = serviceIds.map((serviceId) => {
            return {
                staffId: staff.id,
                serviceId
            };
        });

        await StaffServices.bulkCreate(staffServiceRows, { transaction: t });
        
        await t.commit();
        res.status(201).json({
            message: "staff added successfully"
        });

    } catch (error) {
        console.log("ERROR ADDING STAFF ---> ", error);
        await t.rollback();
        res.status(500).json({
            message: "something went wrong"
        });
    }
};

const markAppointmentCompleted = async (req, res) => {
    
    const t = await sequelize.transaction();

    try {
        
        const salon = await Salons.findOne({
            where: {
                adminId: req.user.id
            }
        });

        if (!salon) {
            return res.status(404).json({message: 'Salon not found'});
        }

        const appointment = await Appointments.findOne({
            where: {
                id: req.params.id,
                salonId: salon.id,
                status: 'booked',
                paymentStatus: 'paid'
            },
            include: [
                { model: Users, as: 'customer' },
                { model: Services, as: 'service' },
                { model: Staff, as: 'staff' }
            ]
        });

        if (!appointment) {
            return res.status(404).json({message: 'Paid booked appointment not found'});
        }

        appointment.status = 'completed';

        await appointment.save({transaction: t});

        const existingInvoice = await Invoice.findOne({
            where: {
                appointmentId: appointment.id
            }
            });

            if (!existingInvoice) {
            const invoiceNumber = `INV-${appointment.id}-${Date.now()}`;

            const pdfPath = await generateInvoicePdf({
                invoiceNumber,
                invoiceDate: new Date().toLocaleDateString(),
                salonName: salon.name,
                customerName: appointment.customer.name,
                serviceName: appointment.service.name,
                staffName: appointment.staff.name,
                appointmentDate: appointment.appointment_date,
                appointmentTime: appointment.appointment_time,
                paymentStatus: appointment.paymentStatus,
                amount: appointment.bookingPrice
            });

            await Invoice.create({
                appointmentId: appointment.id,
                invoiceNumber,
                amount: appointment.bookingPrice,
                pdfPath
            }, { transaction: t });
        }
        await t.commit();

        res.status(200).json({message: 'Appointment marked as completed and invoice generated',appointment});

    } catch (error) {
        console.log('ERROR MARKING APPOINTMENT COMPLETED --->',error);
        await t.rollback();
        res.status(500).json({message: 'Could not mark appointment as completed'});
    }
};

const changeStaffStatus = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const staffId = req.params.id;

        const salon = await Salons.findOne({
            where: {
                adminId: req.user.id
            }
        });

        if (!salon) {
            await t.rollback();
            return res.status(404).json({
                message: "salon not found"
            });
        }

        const staff = await Staff.findOne({
            where: {
                id: staffId,
                salonId: salon.id
            }
        });

        if (!staff) {
            await t.rollback();
            return res.status(404).json({
                message: "staff not found"
            });
        }

        staff.is_active = !staff.is_active;

        await staff.save({ transaction: t });
        await t.commit();

        res.status(200).json({
            message: "staff status updated",
            is_active: staff.is_active
        });

    } catch (error) {
        console.log("ERROR UPDATING STAFF STATUS ---> ", error);
        await t.rollback();
        res.status(500).json({
            message: "something went wrong"
        });
    }
};

const cancelAppointmentByAdmin = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const salon = await Salons.findOne({
            where: {
                adminId: req.user.id
            }
        });

        if (!salon) {
            await t.rollback();
            return res.status(404).json({
                message: "salon not found"
            });
        }

        const appointment = await Appointments.findOne({
            where: {
                id: req.params.id,
                salonId: salon.id,
                status: 'booked',
                paymentStatus: 'paid'
            }
        });

        if (!appointment) {
            await t.rollback();
            return res.status(404).json({
                message: "booked paid appointment not found"
            });
        }

        const appointmentDateTime = new Date(
            `${appointment.appointment_date}T${appointment.appointment_time}`
        );

        if (appointmentDateTime <= new Date()) {
            await t.rollback();
            return res.status(400).json({
                message: "past appointments cannot be cancelled"
            });
        }

        appointment.status = 'cancelled';
        appointment.reminder_sent = true;

        await appointment.save({ transaction: t });
        await t.commit();

        res.status(200).json({
            message: "appointment cancelled successfully"
        });

    } catch (error) {
        console.log("ADMIN CANCEL APPOINTMENT ERROR --->", error);
        await t.rollback();
        res.status(500).json({
            message: "something went wrong"
        });
    }
};

const getEditAppointmentPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'views', 'editAppointment.html'));
};

const getAppointmentDataForAdmin = async (req, res) => {
    try {
        const salon = await Salons.findOne({
            where: { adminId: req.user.id }
        });

        if (!salon) {
            return res.status(404).json({ message: "salon not found" });
        }

        const appointment = await Appointments.findOne({
            where: {
                id: req.params.id,
                salonId: salon.id
            },
            include: [
                { model: Users, as: 'customer' },
                { model: Services, as: 'service' },
                { model: Staff, as: 'staff' }
            ]
        });

        if (!appointment) {
            return res.status(404).json({ message: "appointment not found" });
        }

        res.status(200).json({ appointment });

    } catch (error) {
        console.log("ERROR GETTING APPOINTMENT DATA --->", error);
        res.status(500).json({ message: "something went wrong" });
    }
};

function timeToMinutes(time) {
    const [hours, minutes] = time.slice(0, 5).split(':').map(Number);
    return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}


const getAvailableSlotsForAdmin = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ message: "date is required" });
        }

        const salon = await Salons.findOne({
            where: { adminId: req.user.id }
        });

        if (!salon) {
            return res.status(404).json({ message: "salon not found" });
        }

        const appointment = await Appointments.findOne({
            where: {
                id: req.params.id,
                salonId: salon.id,
                status: 'booked',
                paymentStatus: 'paid'
            }
        });

        if (!appointment) {
            return res.status(404).json({ message: "booked paid appointment not found" });
        }

        const service = await Services.findOne({
            where: {
                id: appointment.serviceId,
                salonId: salon.id,
                is_active: true
            }
        });

        if (!service) {
            return res.status(404).json({ message: "service not found" });
        }

        const staffList = await Staff.findAll({
            where: {
                salonId: salon.id,
                is_active: true
            },
            include: [
                {
                    model: Services,
                    as: 'services',
                    where: {
                        id: appointment.serviceId
                    }
                }
            ]
        });

        const bookedAppointments = await Appointments.findAll({
            where: {
                salonId: salon.id,
                serviceId: appointment.serviceId,
                appointment_date: date,
                status: 'booked',
                paymentStatus: 'paid',
                id: {
                    [Op.ne]: appointment.id
                }
            }
        });

        const bookedSlots = bookedAppointments.map((bookedAppointment) => {
            return `${bookedAppointment.staffId}-${bookedAppointment.appointment_time.slice(0, 5)}`;
        });

        const slots = [];

        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const currentTime = now.toTimeString().slice(0, 5);

        staffList.forEach((staff) => {
            const staffStart = timeToMinutes(staff.available_from);
            const staffEnd = timeToMinutes(staff.available_to);
            const serviceStart = timeToMinutes(service.available_from);
            const serviceEnd = timeToMinutes(service.available_to);

            const startMinutes = Math.max(staffStart, serviceStart);
            const endMinutes = Math.min(staffEnd, serviceEnd);
            const duration = Number(service.duration);

            for (let time = startMinutes; time + duration <= endMinutes; time += duration) {
                const slotTime = minutesToTime(time);

                if (date === today && slotTime <= currentTime) {
                    continue;
                }

                const slotKey = `${staff.id}-${slotTime}`;

                if (!bookedSlots.includes(slotKey)) {
                    slots.push({
                        time: slotTime,
                        staffId: staff.id,
                        staffName: staff.name
                    });
                }
            }
        });

        res.status(200).json({ slots });

    } catch (error) {
        console.log("ERROR GETTING ADMIN AVAILABLE SLOTS --->", error);
        res.status(500).json({ message: "something went wrong" });
    }
};

const rescheduleAppointmentByAdmin = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { staffId, appointment_date, appointment_time } = req.body;

        const salon = await Salons.findOne({
            where: { adminId: req.user.id }
        });

        if (!salon) {
            await t.rollback();
            return res.status(404).json({ message: "salon not found" });
        }

        const appointment = await Appointments.findOne({
            where: {
                id: req.params.id,
                salonId: salon.id,
                status: 'booked',
                paymentStatus: 'paid'
            }
        });

        if (!appointment) {
            await t.rollback();
            return res.status(404).json({ message: "booked paid appointment not found" });
        }

        const staff = await Staff.findOne({
            where: {
                id: staffId,
                salonId: salon.id,
                is_active: true
            },
            include: [
                {
                    model: Services,
                    as: 'services',
                    where: {
                        id: appointment.serviceId
                    }
                }
            ]
        });

        if (!staff) {
            await t.rollback();
            return res.status(404).json({ message: "staff not available for this service" });
        }

        const selectedTime = appointment_time.slice(0, 5);

        const conflict = await Appointments.findOne({
            where: {
                staffId,
                appointment_date,
                appointment_time: selectedTime,
                status: 'booked',
                paymentStatus: 'paid',
                id: {
                    [Op.ne]: appointment.id
                }
            }
        });

        if (conflict) {
            await t.rollback();
            return res.status(409).json({ message: "slot already booked" });
        }

        appointment.staffId = staffId;
        appointment.appointment_date = appointment_date;
        appointment.appointment_time = selectedTime;
        appointment.reminder_sent = false;

        await appointment.save({ transaction: t });
        await t.commit();

        res.status(200).json({
            message: "appointment updated successfully",
            appointment
        });

    } catch (error) {
        console.log("ADMIN RESCHEDULE ERROR --->", error);
        await t.rollback();
        res.status(500).json({ message: "something went wrong" });
    }
};

const getCustomerDetailsPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'adminCustomerDetails.html'));
};

const getCustomerDetailsData = async (req, res) => {
  try {
    const customerId = req.params.id;

    const salon = await Salons.findOne({
      where: {
        adminId: req.user.id
      }
    });

    if (!salon) {
      return res.status(404).json({
        message: 'salon not found'
      });
    }

    const customer = await Users.findByPk(customerId, {
      attributes: ['id', 'name', 'email', 'phone', 'notification_preference']
    });

    if (!customer) {
      return res.status(404).json({
        message: 'customer not found'
      });
    }

    const appointments = await Appointments.findAll({
      where: {
        salonId: salon.id,
        userId: customerId,
        paymentStatus: 'paid'
      },
      include: [
        { model: Services, as: 'service' },
        { model: Staff, as: 'staff' },
        { model: Reviews, as: 'review', required: false },
        { model: Invoice, as: 'invoice', required: false }
      ],
      order: [['appointment_date', 'DESC'], ['appointment_time', 'DESC']]
    });

    if (appointments.length === 0) {
      return res.status(403).json({
        message: 'customer has no appointments with your salon'
      });
    }

    res.status(200).json({
      customer,
      appointments
    });

  } catch (error) {
    console.log('ERROR GETTING CUSTOMER DETAILS --->', error);
    res.status(500).json({
      message: 'something went wrong'
    });
  }
};

const getEditSalonDetailsPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'editSalonDetails.html'));
};

const getSalonDetailsData = async (req, res) => {
  try {
    const salon = await Salons.findOne({
      where: {
        adminId: req.user.id
      }
    });

    if (!salon) {
      return res.status(404).json({
        message: 'salon not found'
      });
    }

    res.status(200).json({
      salon
    });

  } catch (error) {
    console.log('ERROR GETTING SALON DETAILS --->', error);
    res.status(500).json({
      message: 'something went wrong'
    });
  }
};

const updateSalonDetails = async (req, res) => {
  try {
    const {
      name,
      description,
      email,
      address,
      zipcode,
      city,
      phone,
      open_time,
      close_time
    } = req.body;

    if (open_time >= close_time) {
      return res.status(400).json({
        message: 'Opening time must be before closing time'
      });
    }

    const salon = await Salons.findOne({
      where: {
        adminId: req.user.id
      }
    });

    if (!salon) {
      return res.status(404).json({
        message: 'salon not found'
      });
    }

    salon.name = name;
    salon.description = description;
    salon.email = email;
    salon.address = address;
    salon.zip_code = zipcode;
    salon.city = city;
    salon.phone = phone;
    salon.open_time = open_time;
    salon.close_time = close_time;

    await salon.save();

    res.status(200).json({
      message: 'salon details updated successfully',
      salon
    });

  } catch (error) {
    console.log('ERROR UPDATING SALON DETAILS --->', error);
    res.status(500).json({
      message: 'something went wrong'
    });
  }
};


module.exports = {
    getAdminDetailsForm,
    getAdminDashboard,
    getAdminDashboardData,
    postSalonDetails,
    postAddedService,
    getAddServiceForm,
    changeServiceStatus,
    getAddStaffForm,
    getDataForStaffForm,
    postAddStaff,
    markAppointmentCompleted,
    changeStaffStatus,
    cancelAppointmentByAdmin,
    getEditAppointmentPage,
    getAvailableSlotsForAdmin,
    getAppointmentDataForAdmin,
    rescheduleAppointmentByAdmin,
    getCustomerDetailsPage,
    getCustomerDetailsData,
    getEditSalonDetailsPage,
    getSalonDetailsData,
    updateSalonDetails

}
