'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Services extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Services.belongsTo(models.Salons, {
        foreignKey: 'salonId',
        as: 'salon'
      });

      Services.hasMany(models.Staff, {
        foreignKey: 'serviceId',
        as: 'staff'
      });

      Services.hasMany(models.Appointments, {
          foreignKey: 'serviceId',
          as: 'appointments'
      });
    }
  }
  Services.init({
    
    name: {
      type: DataTypes.STRING,
      allowNull:false
    },
    
    description: {
      type:DataTypes.TEXT,
      allowNull:false
    },
    
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    price: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },

    salonId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Services',
  });
  return Services;
};