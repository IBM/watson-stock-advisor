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

class Utils {

  /**
   * Checks if the given 'func' is a functions
   * @param {*} func
   * @returns {boolean} - true if the type of the arg is a function, false otherwise
   */
  isFunc(func) {
    return typeof func == 'function';
  }

  /**
   * Searches the stocks for a company name matching (case-insensitive) the company.
   * Returns undefined if not found
   * @param {stock[]} stocks - The list of stocks
   * @param {string} company - The name of the company to look for
   * @returns {stock|undefined}
   */
  findStockDatum(stocks, company) {

    if (!company) {
      return undefined;
    }

    for (var i=0; i<stocks.length; i++) {
      var stock = stocks[i];
      var name = (stock.company && stock.company.toLowerCase()) || "";
      if (name === company.toLowerCase()) {
        return stock;
      }
    }

    return undefined;
  }

}

module.exports = new Utils()
