'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.addColumn('Appointments', 'paymentStatus', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'pending'
    });

    await queryInterface.addColumn('Appointments', 'orderId', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Appointments', 'paymentSessionId', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('Appointments', 'paymentStatus');
    await queryInterface.removeColumn('Appointments', 'orderId');
    await queryInterface.removeColumn('Appointments', 'paymentSessionId');
  }
};
