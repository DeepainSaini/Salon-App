'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addIndex('Appointments', ['userId']);
    await queryInterface.addIndex('Appointments', ['salonId']);
    await queryInterface.addIndex('Appointments', ['staffId']);
    await queryInterface.addIndex('Appointments', ['serviceId']);
    await queryInterface.addIndex('Appointments', ['appointment_date']);
    await queryInterface.addIndex('Appointments', ['status']);
    await queryInterface.addIndex('Appointments', ['paymentStatus']);

    await queryInterface.addIndex('Appointments', ['staffId', 'appointment_date', 'appointment_time'], {
      name: 'idx_appointments_staff_date_time'
    });

    await queryInterface.addIndex('Appointments', ['salonId', 'serviceId', 'appointment_date'], {
      name: 'idx_appointments_salon_service_date'
    });

    await queryInterface.addIndex('Appointments', ['userId', 'paymentStatus', 'status'], {
      name: 'idx_appointments_user_payment_status'
    });

    await queryInterface.addIndex('Services', ['salonId']);
    await queryInterface.addIndex('Services', ['salonId', 'is_active'], {
      name: 'idx_services_salon_active'
    });

    await queryInterface.addIndex('Staffs', ['salonId']);
    await queryInterface.addIndex('Staffs', ['salonId', 'is_active'], {
      name: 'idx_staffs_salon_active'
    });

    await queryInterface.addIndex('Reviews', ['appointmentId']);
    await queryInterface.addIndex('Reviews', ['userId']);

    await queryInterface.addIndex('StaffServices', ['staffId']);
    await queryInterface.addIndex('StaffServices', ['serviceId']);
    await queryInterface.addIndex('StaffServices', ['staffId', 'serviceId'], {
      name: 'idx_staff_services_staff_service'
    });

    await queryInterface.addIndex('Users', ['email']);
    await queryInterface.addIndex('Users', ['role']);

    await queryInterface.addIndex('Salons', ['adminId']);
    await queryInterface.addIndex('Salons', ['name']);
    await queryInterface.addIndex('Salons', ['city']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('Appointments', ['userId']);
    await queryInterface.removeIndex('Appointments', ['salonId']);
    await queryInterface.removeIndex('Appointments', ['staffId']);
    await queryInterface.removeIndex('Appointments', ['serviceId']);
    await queryInterface.removeIndex('Appointments', ['appointment_date']);
    await queryInterface.removeIndex('Appointments', ['status']);
    await queryInterface.removeIndex('Appointments', ['paymentStatus']);

    await queryInterface.removeIndex('Appointments', 'idx_appointments_staff_date_time');
    await queryInterface.removeIndex('Appointments', 'idx_appointments_salon_service_date');
    await queryInterface.removeIndex('Appointments', 'idx_appointments_user_payment_status');

    await queryInterface.removeIndex('Services', ['salonId']);
    await queryInterface.removeIndex('Services', 'idx_services_salon_active');

    await queryInterface.removeIndex('Staffs', ['salonId']);
    await queryInterface.removeIndex('Staffs', 'idx_staffs_salon_active');

    await queryInterface.removeIndex('Reviews', ['appointmentId']);
    await queryInterface.removeIndex('Reviews', ['userId']);

    await queryInterface.removeIndex('StaffServices', ['staffId']);
    await queryInterface.removeIndex('StaffServices', ['serviceId']);
    await queryInterface.removeIndex('StaffServices', 'idx_staff_services_staff_service');

    await queryInterface.removeIndex('Users', ['email']);
    await queryInterface.removeIndex('Users', ['role']);

    await queryInterface.removeIndex('Salons', ['adminId']);
    await queryInterface.removeIndex('Salons', ['name']);
    await queryInterface.removeIndex('Salons', ['city']);
  }
};
