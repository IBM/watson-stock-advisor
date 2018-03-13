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
      var name = (stock.company && stock.company.toLowerCase()) || '';
      if (name === company.toLowerCase()) {
        return stock;
      }
    }

    return undefined;
  }

  /**
   * Parses the AV version of the date from the article date format
   * @param {string} articleDate
   */
  convertArticleDateToAVDate(articleDate) {
    return articleDate ? articleDate.slice(0, 10) : undefined;
  }

  /**
   * Converts avDate with format (YYYY-MM-DD) to a Date object
   * @param {string} dateStr
   * @returns {Date}
   */
  avDateStringToDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return new Date(year, month - 1, day);
  }

  /**
   * Finds and extracts the substring of str starting with http:// or https:// and continuing
   * through the rest of the string
   * @param {string} str
   * @returns {string|undefined} the URL, or undefined
   */
  extractHTTPURL(str) {

    if (!str) {
      return undefined;
    }

    var httpIndex = str.indexOf('http://');
    if (httpIndex == -1) {
      httpIndex = str.indexOf('https://');
    }
    if (httpIndex > -1) {
      return str.substring(httpIndex, str.length);
    }
    return undefined;
  }

  /**
   * Finds and extracts the domain in the url, starting with http
   * and continuing up until the / after http:// or https://
   * @param {string} url
   * @returns {string|undefined} the domain, or undefined
   */
  extractDomain(url) {

    if (!url) {
      return undefined;
    }

    var domain;
    if (url.indexOf('http') > -1) {
      var split = url.split('/');
      if (split.length > 2) {
        domain = split[0] + '//' + split[2];
      }
    }
    return domain;
  }

}

module.exports = new Utils();
