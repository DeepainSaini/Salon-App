'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Salons extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Salons.belongsTo(models.Users, {
        foreignKey: 'adminId',
        as: 'admin'
      });

      Salons.hasMany(models.Services, {
        foreignKey: 'salonId',
        as: 'services' 
      });

      Salons.hasMany(models.Staff, {
        foreignKey: 'salonId',
        as: 'staff'
      });

      Salons.hasMany(models.Appointments, {
          foreignKey: 'salonId',
          as: 'appointments'
      });
    }
  }
  Salons.init({
    name: {
      type: DataTypes.STRING,
      allowNull:false
    },
    
    description: {
      type: DataTypes.TEXT,
      allowNull:false
    },

    phone: {
      type: DataTypes.STRING,
      allowNull:false
    },

    email: {
      type: DataTypes.STRING,
      allowNull:false
    },

    address: {
      type: DataTypes.STRING,
      allowNull:false
    },

    city: {
      type: DataTypes.STRING,
      allowNull:false
    },

    zip_code: {
      type: DataTypes.STRING,
      allowNull:false
    },

    open_time: {
      type: DataTypes.TIME,
      allowNull:false
    },

    close_time: {
      type: DataTypes.TIME,
      allowNull:false
    },

    adminId: {
      type: DataTypes.INTEGER,
      allowNull:false
    }
  }, {
    sequelize,
    modelName: 'Salons',
  });
  return Salons;
};