//---CONFIGURE AUTHENTICATION HERE--------------------
var CLOUDANT_KEY      = 'XXXXXXXXX';
var CLOUDANT_PASSWORD = 'YYYYYYYYY';
var CLOUDANT_ACCESS   = 'someurl-bluemix.cloudant.com'
var DB_NAME = 'DB_NAME';
//----------------------------------------------------

const Cloudant = require('cloudant');
const utils = require('./utils.js');

var cloudant = Cloudant({
  account: CLOUDANT_ACCESS,
  key: CLOUDANT_KEY,
  password: CLOUDANT_PASSWORD
});
var db = cloudant.db.use(DB_NAME);

function getDocs(callback) {
  db.list({
    //this field is needed to return all doc data
    include_docs: true
  }, function(err, data) {
    if (utils.isFunc(callback)) {
      var docs = data.rows.map(function(row) {
        return row.doc;
      });
      callback(err, docs);
    }
  });
}

//include _id and _rev of existing doc in the doc to perform an update
function insertOrUpdateDoc(doc, callback) {

  db.insert(doc, function(err, body, header) {
    if (err) {
      console.log('insertion failed: ' + err.message);
    } else if (utils.isFunc(callback)) {
      callback(body, header);
    }
  });
}

module.exports = {
  getDocs : getDocs,
  insertOrUpdateDoc : insertOrUpdateDoc
}
