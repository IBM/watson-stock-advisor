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
const alphaVantageAPI = new AlphaVantageAPI(config.ALPHAVANTAGE.api_key, 'compact', true);

/**
 * Creates a map between date and price from the response from AlphaVantage
 * @param {alphaVantageData} dailyData
 * @returns {map} priceMap
 */
function parsedailyData(dailyData) {
  var stockPriceMap = {};

  for (var id in dailyData) {
    var date = dailyData[id]["Timestamp"];
    var dateString = JSON.stringify(date);
    dateString = dateString.slice(1,11);
    var price = dailyData[id]["Close"];
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
          console.log(stockPriceMap);
          resolve(stockPriceMap);
        }).catch((err) => {
          console.error(err);
          reject(err);
        });
    });
  }
}
