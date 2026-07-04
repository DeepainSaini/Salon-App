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
    await queryInterface.addColumn('Services', 'is_active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });

    await queryInterface.changeColumn('Services', 'name', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('Services', 'description', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('Services', 'duration', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('Services', 'price', {
      type: Sequelize.STRING,
      allowNull: false
    });

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    
    await queryInterface.changeColumn('services', 'price', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.changeColumn('services', 'duration', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.changeColumn('services', 'description', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.changeColumn('services', 'name', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.removeColumn('Services', 'is_active');
  }
};
