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

const stockService = require('./services/stock-service');
const Error = require('./models/error');

module.exports = function(app) {

  // server routes
  app.get('/api/stocks', (req, res) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    stockService.getStocks().then((stocks) => {
      var prettyStocks = stocks.map((rawStock) => {
        var doc = rawStock.doc;
        return {
          company : doc.ticker,
          ticker : "TODO", //TODO
          history : doc.history || []
        }
      })
      res.send(prettyStocks);
    }).catch((error) => {
      console.log(error);
      res.send(new Error('Stocks Error', 'There was an error retrieving stocks'));
    });
  });

  // frontend routes
  app.get('*', function(req, res) {
    res.sendFile('./public/index.html');
  });

};
