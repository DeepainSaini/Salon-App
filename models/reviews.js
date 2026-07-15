'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Reviews extends Model {
    static associate(models) {
      Reviews.belongsTo(models.Appointments, {
        foreignKey: 'appointmentId',
        as: 'appointment'
      });

      Reviews.belongsTo(models.Users, {
        foreignKey: 'userId',
        as: 'customer'
      });
    }
  }

  Reviews.init({
    appointmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    rating: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    comment: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    staffResponse: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    respondedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Reviews'
  });

  return Reviews;
};