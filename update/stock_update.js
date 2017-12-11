//---CONFIGURE AUTHENTICATION HERE--------------------
var CLOUDANT_KEY      = 'XXXXXXXXX';
var CLOUDANT_PASSWORD = 'YYYYYYYYY';
var CLOUDANT_ACCESS   = 'someurl-bluemix.cloudant.com'
var DB_NAME = 'DB_NAME';
//----------------------------------------------------

var Cloudant = require('cloudant');

var cloudant = Cloudant({account:CLOUDANT_ACCESS, key: CLOUDANT_KEY, password: CLOUDANT_PASSWORD});
var db = cloudant.db.use(DB_NAME);

function updateStocks() {

}

updateStocks();
