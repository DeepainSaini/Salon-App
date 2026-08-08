'use strict';

module.exports = (sequelize, DataTypes) => {
  const StaffServices = sequelize.define('StaffServices', {
    staffId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  return StaffServices;
};