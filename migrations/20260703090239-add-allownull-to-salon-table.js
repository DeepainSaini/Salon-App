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

    await queryInterface.changeColumn('Salons', 'name', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('Salons', 'description', {
      type: Sequelize.TEXT,
      allowNull: false
    });

    await queryInterface.changeColumn('Salons', 'phone', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('Salons', 'email', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('Salons', 'address', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('Salons', 'city', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('Salons', 'zip_code', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('Salons', 'open_time', {
      type: Sequelize.TIME,
      allowNull: false
    });

    await queryInterface.changeColumn('Salons', 'close_time', {
      type: Sequelize.TIME,
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

    await queryInterface.changeColumn('Salons', 'close_time', {
      type: Sequelize.TIME,
      allowNull: true
    });

    await queryInterface.changeColumn('Salons', 'open_time', {
      type: Sequelize.TIME,
      allowNull: true
    });

    await queryInterface.changeColumn('Salons', 'zip_code', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('Salons', 'city', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('Salons', 'address', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('Salons', 'email', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('Salons', 'phone', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('Salons', 'description', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.changeColumn('Salons', 'name', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};
