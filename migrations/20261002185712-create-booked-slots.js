'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BookedSlots', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      staffId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Staffs',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      appointmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Appointments',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      appointment_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addConstraint('BookedSlots', {
      fields: ['staffId', 'appointment_date', 'start_time'],
      type: 'unique',
      name: 'unique_staff_slot'
    });

    await queryInterface.addConstraint('BookedSlots', {
      fields: ['appointmentId'],
      type: 'unique',
      name: 'unique_booked_slot_appointment'
    });

    await queryInterface.addIndex('BookedSlots', ['staffId', 'appointment_date', 'start_time', 'end_time'], {
      name: 'idx_booked_slots_overlap_lookup'
    });

  },
  
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('BookedSlots');
  }
};