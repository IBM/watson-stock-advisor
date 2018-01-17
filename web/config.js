
var fs = require('fs');
require('dotenv').config()

var configured = false;

if (fs.existsSync('.env')) {
  configured = true;
} else {
  console.log(".env file not found")
}

module.exports = {
  configured : configured
}
