const config = require('./config.json' );

module.exports = {
  DISCOVERY_KEY          : config.keys.DISCOVERY_KEY,
  DISCOVERY_PASSWORD     : config.keys.DISCOVERY_PASSWORD,
  DISCOVERY_VERSION      : config.keys.DISCOVERY_VERSION,
  DISCOVERY_VERSION_DATE : config.keys.DISCOVERY_VERSION_DATE,
  ENV_ID                 : config.keys.ENV_ID,
  CLOUDANT_KEY           : config.keys.CLOUDANT_KEY,
  CLOUDANT_PASSWORD      : config.keys.CLOUDANT_PASSWORD,
  CLOUDANT_ACCESS        : config.keys.CLOUDANT_ACCESS,
  DB_NAME                : config.keys.DB_NAME
}