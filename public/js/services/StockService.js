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

angular.module('MainModule').factory('StockService', ['$http', function($http) {

  var service = {};

  /**
   * Extracts data from the result of the promise if successful,
   * otherwise logs the error and rejects
   * @param {promise}
   * @returns {promise}
   */
  function handlePromise(promise) {
    return new Promise((resolve, reject) => {
      promise.then((result) => {
        resolve(result.data);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  /**
   * Performs an HTTP GET
   * @param {string} path
   * @param {object} params
   * @returns {promise}
   */
  function get(path) {
    var promise = $http.get(path);
    return handlePromise(promise);
  }

  /**
   * Performs an HTTP POST
   * @param {string} path
   * @param {object} params
   * @returns {promise}
   */
  function post(path, params) {
    var promise = $http.post(path, params);
    return handlePromise(promise);
  }

  /**
   * Fetches the stock data from the API
   * @returns {promise}
   */
  service.getStocks = function() {
    return get('/api/stocks');
  };

  /**
   * Retrives the list of all available companies and their tickers
   * @returns {promise}
   */
  service.getAllCompanies = function() {
    return get('/api/companies');
  };

  /**
   * Sends a request to add company to list of tracked companies
   * @param {company} company
   * @returns {promise}
   */
  service.add = function(company) {
    return post('/api/companies/add', {
      name : company
    });
  };

  /**
   * Sends a request to delete company from the list of tracked companies
   * @param {company} company
   * @returns {promise}
   */
  service.delete = function(company) {
    return post('/api/companies/delete', {
      name : company
    });
  };

  return service;
}]);
