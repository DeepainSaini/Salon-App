'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Users.hasOne(models.Salons, {
        foreignKey: 'adminId',
        as: 'salon' 
      });

      Users.hasMany(models.Appointments, {
          foreignKey: 'userId',
          as: 'appointments'
      });
    }
  }
  Users.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,

    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    role: {
      type: DataTypes.STRING,
      defaultValue: 'customer'
    },
    notification_preference: {
      type: DataTypes.ENUM('email', 'sms'),
      allowNull: false,
      defaultValue: 'email',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    profile_completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'Users',
  });
  return Users;
};