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

const db = require('../util/cloudantDb');
const update = require('../services/stockUpdate');
const stockUpdate = new update();
const utils = require('../util/utils');
const config = require('../../config');

class StockService {

  /**
   * Retrieves all the stock data and their associated articles
   * @returns {promise} - the promise from the cloudant DB
   */
  getStocks() {
    return db.search();
  }

  /**
   * Finds the entr(y/ies) with a company of the given name
   * @param {string} companyName
   * @returns {promise} - the promise from the cloudant DB
   */
  getStockByCompanyName(companyName) {
    return db.getByCompanyName(companyName);
  }

  /**
   * Adds a company with the given name to the watch list and
   * fetches articles from discovery
   * @param {string} companyName
   * @returns {promise}
   */
  addCompany(companyName) {
    return new Promise((resolve, reject) => {
      db.search().then((rows)  => {
        var docs = rows.map(function(row) {
          return row.doc;
        });

        if (docs.length >= config.MAX_COMPANIES) {
          reject('No more than ' + config.MAX_COMPANIES + ' companies may be watched.');
        } else {
          //check that the company is not already being watched
          if (utils.findStockDatum(docs, companyName)) {
            reject('This company is already being watched');
          } else {
            stockUpdate.run([companyName]).then((results) => {
              var newResult = utils.findStockDatum(results, companyName);
              resolve(newResult);
            }).catch((error) => {
              reject(error);
            });
          }
        }
      });
    });
  }

  /**
   * Deletes the entry in the DB with doc.company = companyName
   * @param {string} companyName
   * @returns {promise}
   */
  deleteCompany(companyName) {

    return new Promise((resolve, reject) => {
      this.getStockByCompanyName(companyName).then((stocks) => {
        var companyDoc = stocks.docs[0];
        if (companyDoc) {
          db.delete(companyDoc).then(() => {
            resolve();
          }).catch((error) => {
            console.log(error);
            reject();
          });
        }
      }).catch((error) => {
        console.log(error);
        reject();
      });
    });
  }

  /**
   * @returns {company} - the list of all loaded companies
  */
  getAllCompanies() {
    return config.companies;
  }

}

module.exports = new StockService();