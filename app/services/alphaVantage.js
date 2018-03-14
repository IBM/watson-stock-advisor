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

const config = require('../../config');

const AlphaVantageAPI = require('alpha-vantage-cli').AlphaVantageAPI;
const API_KEY = config.ALPHAVANTAGE.api_key;
const PLACEHOLDER = 'placeholder';
var alphaVantageAPI;
if (API_KEY) {
  if (API_KEY == PLACEHOLDER) {
    console.log('ALPHAVANTAGE_API_KEY needs to be set correctly. It is currently set to ' + PLACEHOLDER);
  } else {
    console.log('initializing AlphaVantage with API key: ' + API_KEY);
    alphaVantageAPI = new AlphaVantageAPI(API_KEY, 'compact', true);
  }
} else {
  console.log('ALPHAVANTAGE_API_KEY needs to be set correctly. It is currently not defined.');
}

/**
 * Creates a map between date and price from the response from AlphaVantage
 * @param {alphaVantageData} dailyData
 * @returns {map} priceMap
 */
function parsedailyData(dailyData) {
  var stockPriceMap = {};

  for (var id in dailyData) {
    var date = dailyData[id]['Timestamp'];
    var dateString = JSON.stringify(date);
    dateString = dateString.slice(1,11);
    var price = dailyData[id]['Close'];
    stockPriceMap[dateString] = price; // date:price
  }
  return stockPriceMap;
}

class AlphaVantage {

  /**
   * Returns a price map
   * @param {string} companyTicker
   * @returns promise - the result is a price map by date, or an error
   */
  getPriceHistoryForTicker(companyTicker) {
     
    return new Promise((resolve, reject) => {
      alphaVantageAPI.getDailyData(companyTicker)
        .then((dailyData) => {
          var stockPriceMap = parsedailyData(dailyData);
          resolve(stockPriceMap);
        }).catch((err) => {
          reject(err);
        });
    });
  }
}

module.exports = new AlphaVantage();
