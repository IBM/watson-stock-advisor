/**
 * Copyright 2018 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

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

  /**
   * Retrieves all data in the cloudant DB
   * @returns {promise} - A promise representing the query to the DB
   */
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

  getCompanyNames() {
      return new Promise((resolve, reject) => {
         this.search().then((rows) => {
            var tickers = rows.map(function(row) {
              return row.doc.ticker;
            })
            resolve(tickers);
          }).catch((error) => {
            reject(error);
          });
      });
  }

  /**
   * Inserts (or updates, if exists) the doc into the DB
   * @returns {promise} - A promise representing the query to the DB
   */
  insertOrUpdate(doc) {
    console.log('updating: ', doc);
    return new Promise((resolve, reject) => {
      db.insert(doc, function(err, body, header) {
        if (err) {
          console.log('insertion failed: ' + err.message);
          reject(err);
        } else {
          resolve(body, header);
        }
      });
    });
  };
}

module.exports = new DB();
