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

      Staff.belongsToMany(models.Services, {
        through: models.StaffServices,
        foreignKey: 'staffId',
        otherKey: 'serviceId',
        as: 'services'
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

    password: {
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
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },

    mustChangePassword: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Staff',
  });
  return Staff;
};