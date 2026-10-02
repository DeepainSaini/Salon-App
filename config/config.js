const { config } = require('./appConfig');

const databaseConfig = {
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  host: config.database.host,
  dialect: config.database.dialect
};

module.exports = {
  development: databaseConfig,
  test: databaseConfig,
  production: databaseConfig
};
