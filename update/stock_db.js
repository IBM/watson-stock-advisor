
const Cloudant = require('cloudant');
const utils = require('./utils.js');
const config = require('./config.js');

var cloudant = Cloudant({
  account  : process.env.CLOUDANT_ACCESS,
  key      : process.env.CLOUDANT_KEY,
  password : process.env.CLOUDANT_PASSWORD
});
var db = cloudant.db.use(process.env.DB_NAME);

function getDocs(callback) {
  db.list({
    //this field is needed to return all doc data
    include_docs: true
  }, function(err, data) {
    if (utils.isFunc(callback)) {
    console.log(err);
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
