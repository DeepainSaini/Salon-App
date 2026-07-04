'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Appointments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Appointments.belongsTo(models.Users, {
          foreignKey: 'userId',
          as: 'customer'
      });

      Appointments.belongsTo(models.Salons, {
          foreignKey: 'salonId',
          as: 'salon'
      });

      Appointments.belongsTo(models.Services, {
          foreignKey: 'serviceId',
          as: 'service'
      });

      Appointments.belongsTo(models.Staff, {
          foreignKey: 'staffId',
          as: 'staff'
      });
    }
  }
  Appointments.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull:false
    },
    salonId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    staffId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    appointment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    appointment_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    reminder_sent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },

    paymentStatus: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending'
    },

    orderId: {
        type: DataTypes.STRING,
        allowNull: true
    },

    paymentSessionId: {
        type: DataTypes.STRING,
        allowNull: true
    }

  }, {
    sequelize,
    modelName: 'Appointments',
  });
  return Appointments;
};