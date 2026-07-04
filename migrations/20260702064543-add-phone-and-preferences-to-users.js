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
    await queryInterface.addColumn('Users', 'phone', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Users', 'notification_preference', {
      type: Sequelize.ENUM('email', 'sms'),
      allowNull: true,
      defaultValue: 'email',
    });

    await queryInterface.addColumn('Users', 'notes', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('Users', 'profile_completed', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('Users', 'phone');
    await queryInterface.removeColumn('Users', 'notification_preference');
    await queryInterface.removeColumn('Users', 'notes');
    await queryInterface.removeColumn('Users', 'profile_completed');
  }
};
