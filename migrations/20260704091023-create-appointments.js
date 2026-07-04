'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Appointments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      
      userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },

        salonId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Salons',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },

        serviceId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Services',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },

        staffId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Staffs',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },

        appointment_date: {
            type: Sequelize.DATEONLY,
            allowNull: false
        },

        appointment_time: {
            type: Sequelize.TIME,
            allowNull: false
        },

        status: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'booked'
        }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Appointments');
  }
};