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

const AlphaVantageAPI = require('alpha-vantage-cli').AlphaVantageAPI;
const PLACEHOLDER = 'placeholder';
var alphaVantageAPI;

function initializeAPI() {

  var API_KEY = process.env.ALPHAVANTAGE_API_KEY;
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
}

/**
 * Creates a map between date and data from the response from AlphaVantage
 * @param {alphaVantageData} dailyData
 * @returns {map} dataMap
 */
function parseDailyData(dailyData) {
  var stockDataMap = {};
  for (var id in dailyData) {
    var dayData = dailyData[id];
    var date = dayData['Timestamp'];
    var dateString = JSON.stringify(date);
    dateString = dateString.slice(1,11);
    delete dayData['Timestamp'];
    stockDataMap[dateString] = dayData;
  }
  return stockDataMap;
}

class AlphaVantage {

  /**
   * Returns a data map
   * @param {string} companyTicker
   * @returns promise - the result is a data map by date, or an error
   */
  getDataHistoryForTicker(companyTicker) {
     
    return new Promise((resolve, reject) => {

      if (!alphaVantageAPI) {
        initializeAPI();
        
        if (!alphaVantageAPI) {
          reject('AlphaVantage API Not initialized');
          return;
        }
      }

      alphaVantageAPI.getDailyData(companyTicker)
        .then((dailyData) => {
          var stockDataMap = parseDailyData(dailyData);
          resolve(stockDataMap);
        }).catch((err) => {
          reject(err);
        });
    });
  }
}

initializeAPI();
module.exports = new AlphaVantage();
