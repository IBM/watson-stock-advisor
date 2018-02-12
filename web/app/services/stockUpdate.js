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
const utils  = require('../util/utils');

const stock_db  = config.configured && require('../util/cloudantDb');
const discovery = config.configured && require('./discovery');

/**
 * Searches the stocks for a ticker matching (case-insensitive) the company.
 * Returns undefined if not found
 * @param {stock[]} stocks - The list of stocks
 * @param {string} company - The name of the company to look for
 * @returns {stock|undefined}
 */
function findStockDatum(stocks, company) {

  if (!company) {
    return undefined;
  }

  for (var i=0; i<stocks.length; i++) {
    var stock = stocks[i];
    var name = (stock.ticker && stock.ticker.toLowerCase()) || "";
    if (name === company.toLowerCase()) {
      return stock;
    }
  }

  return undefined;
}

/**
 * Sorts and returns the articles from most to least recent by date
 * @param {article[]} articles
 * @returns {article[]}
 */
function sortArticles(articles) {
  
  articles.sort(function(a, b) {
    return new Date(b.date) - new Date(a.date);
  });
  
  return articles;
}

/**
 * Searches for the given article in the list of articles
 * @param {article} article
 * @param {article[]} articles
 * @returns {boolean} True if the article is found, false otherwise
 */
function articleContains(article, articles) {
  for (var x=0; x<articles.length; x++) {
    if (article.url === articles[x].url) {
      return true;
    }
  }
  return false;
}

/**
 * Updates the database with the article data. New (unique) articles
 * are inserted into the database. Duplicates are removed. The articles
 * are sorted from most to least recent for each before updating DB.
 * @param {article[]} articleData
 * @param {stocks[]} stockData
 */
function updateStocksData(articleData, stockData) {
  
  for (var i=0; i<articleData.length; i++) {
    var articleDatum = articleData[i];
    var company = articleDatum.company;
    console.log('Beginning article insertion for "' + company + '"');
    var stockDatum = findStockDatum(stockData, company);
    if (!stockDatum) {
      stockDatum = {
        ticker : company,
        history : []
      }
    }
    var existingArticles = stockDatum.history || [];
    
    //filter existing articles
    var newArticles = articleDatum.articles.filter(function(article) {
      var articleExists = articleContains(article, existingArticles);
      if (articleExists) {
        console.log('Not adding duplicate article: ' + article.url);
      }
      return !articleExists;
    });
        
    //TODO batch insert?
    if (newArticles.length > 0) {
      stockDatum.history = sortArticles(existingArticles.concat(newArticles));
      console.log('Inserting into company "' + company + '" articles: ' );
      console.log(newArticles);
      stock_db.insertOrUpdate(stockDatum);
    } else {
      console.log('No new articles to insert into "' + company + '"');
    }
  }
}

/**
 * Parses a single discovery result for the relevant data
 * @param {discoveryResult} result
 * @returns a simplified JSON object with relevant data
 */
function parseArticle(result) {
  return {
    url: result.url,
    sentiment: result.enriched_text.sentiment.document.label,
    date: result.crawl_date
  }
}

/**
 * Parses raw Watson Discovery Results for articles
 * @param {result[]} results
 * @returns {article[]} - The parsed articles
 */
function parseResults(results) {
  var articles = [];
  for (var i=0; i<results.length; i++) {
    articles.push(parseArticle(results[i]));
  }
  return articles;
}

/**
 * Retrieves article data for the given company
 * @param {string} company
 * @param {function} callback - Called after retrieval and parsing complete
 * @param {promise} - The promise for the request to Watson Discovery
 */
function getArticleDataForCompany(company, callback) {
  
  var promise = discovery.query(company);
    
  promise.then(function (data) {
    var results = data.results;
    console.log('Received ' + results.length + ' articles for "' + company + '"');
    var articles = parseResults(results);
    var data = {
      company : company,
      articles : articles
    }
    callback(data);
  }).catch(function (error) {
    callback([], error);
  });
  
  return promise;
}

/**
 * Retrieves article data for the given company
 * @param {string[]} companies - The list of companies to retrieve articles for
 * @param {function} callback - Called after retrieval and parsing complete
 */
function getArticleDataForCompanies(companies, callback) {
  
  var promises = [];
  var articleData = [];
  var errors = [];
  
  for (var i=0; i<companies.length; i++) {
    var company = companies[i];
    console.log('Starting discovery for "' + company + '"');
    var promise = getArticleDataForCompany(company, function(articleDataForCompany, error) {
      if (error) {
        errors = errors.concat(error);
      } else {
        articleData = articleData.concat(articleDataForCompany);
      }
    });
    promises.push(promise);
  }
  
  Promise.all(promises).then(function() {
    if (utils.isFunc(callback)) {
      callback(articleData);
    }
  }).catch(function(error) {
    if (utils.isFunc(callback)) {
      callback(articleData, errors.join());
    }
  });
}

class StockUpdate {
  
  /**
   * Retrieve new data for the given companies
   * @param {string[]} companies
   */
  run(companies) {

    if (!config.configured) {
      console.log("Project is not configured correctly...terminating");
      return;
    }

    stock_db.search().then((rows)  => {
      var docs = rows.map(function(row) {
        return row.doc;
      });

      //if no companies provided, update all in DB
      if (!companies) {
        companies = docs.map(function(doc) {
          return doc.ticker;
        });
      }
      if (companies && companies.length > 0) {
        getArticleDataForCompanies(companies, function(articleData, articlesErr) {
          if (!articlesErr) {
            updateStocksData(articleData, docs);
          } else {
            console.log(articlesErr);
          }
        });
      } else {
        console.log('No companies to update');
      }
    }).catch((docsErr) => {
      console.log(docsErr);
    });
  }
}

module.exports = StockUpdate;
