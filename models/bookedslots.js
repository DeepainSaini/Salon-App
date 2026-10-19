'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BookedSlots extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      BookedSlots.belongsTo(models.Staff, {
        foreignKey: 'staffId',
        as: 'staff'
      });

      BookedSlots.belongsTo(models.Appointments, {
        foreignKey: 'appointmentId',
        as: 'appointment'
      });
    }
  }
  BookedSlots.init({
     staffId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    appointmentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    appointment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },

    start_time: {
      type: DataTypes.TIME,
      allowNull: false
    },

    end_time: {
      type: DataTypes.TIME,
      allowNull: false
    }

  }, {
    sequelize,
    modelName: 'BookedSlots',
  });
  return BookedSlots;
};