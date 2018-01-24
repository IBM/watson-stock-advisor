
const fs = require('fs');
const appRoot = require('app-root-path');
const env_path  = appRoot + '/.env'
require('dotenv').config({path: env_path})

var configured = false;

if (fs.existsSync(env_path)) {
  configured = true;
} else {
  console.log(".env file not found")
}

module.exports = {
  configured : configured
}
