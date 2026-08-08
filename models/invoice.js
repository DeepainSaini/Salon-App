'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
       Invoice.belongsTo(models.Appointments, {
        foreignKey: 'appointmentId',
        as: 'appointment'
      });
    }
  }
  Invoice.init({
    appointmentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    pdfPath: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Invoice',
  });
  return Invoice;
};