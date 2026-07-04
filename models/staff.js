'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Staff extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Staff.belongsTo(models.Salons, {
        foreignKey: 'salonId',
        as: 'salon'
      });

      Staff.belongsTo(models.Services, {
        foreignKey: 'serviceId',
        as: 'service'
      });

      Staff.hasMany(models.Appointments, {
          foreignKey: 'staffId',
          as: 'appointments'
      });
    }
  }
  Staff.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false
    },

    specialization: {
      type: DataTypes.STRING,
      allowNull: false
    },

    available_from: {
      type: DataTypes.TIME,
      allowNull: false
    },

    available_to: {
      type: DataTypes.TIME,
      allowNull: false
    },

    salonId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Staff',
  });
  return Staff;
};