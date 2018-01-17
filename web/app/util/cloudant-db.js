const Cloudant = require('cloudant');
const utils = require('./utils.js');
require('../../config.js');

const cloudant = Cloudant({
  account  : process.env.CLOUDANT_ACCESS,
  key      : process.env.CLOUDANT_KEY,
  password : process.env.CLOUDANT_PASSWORD
});
const db = cloudant.db.use(process.env.DB_NAME);

class DB {

  search() {
    return new Promise((resolve, reject) => {
      db.list({ include_docs: true }, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.rows);
        }
      });
    });
  };

  insertOrUpdate(doc) {
    console.log('updating: ', doc);
    return new Promise((resolve, reject) => {
      db.insert(doc, function(err, body, header) {
        if (err) {
          console.log('insertion failed: ' + err.message);
          reject(err);
        } else if (utils.isFunc(callback)) {
          resolve(body, header);
        }
      });
    });
  };

}

module.exports = new DB();
