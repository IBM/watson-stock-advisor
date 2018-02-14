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
 * Searches the stocks for a company name matching (case-insensitive) the company.
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
    var name = (stock.company && stock.company.toLowerCase()) || "";
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
  
  var results = stockData;

  for (var i=0; i<articleData.length; i++) {
    var articleDatum = articleData[i];
    var company = articleDatum.company;
    console.log('Beginning article insertion for "' + company + '"');
    var stockDatum = findStockDatum(stockData, company);
    if (!stockDatum) {
      stockDatum = {
        company : company,
        ticker  : findTickerForCompanyWithName(company) || 'No Ticker Found',
        history : []
      }
      results.push(stockDatum);
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
  return results;
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
    date: result.crawl_date,
    title: result.enriched_title.relations.sentence, 
    source: result.enriched_title.entities.text
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
  
  var filterDuplicates = function(articles) {
    var seen = {};
    return articles.filter(function(article) {
      var wasSeen = seen.hasOwnProperty(article.url);
      if (!wasSeen) {
        seen[article.url] = true;
      } else {
        console.log('Received duplicate article ' + article.url + ' from Discovery');
      }
      return !wasSeen;
    });
  }

  var promise = discovery.query(company);
    
  promise.then(function (data) {
    var results = data.results;
    var articles = filterDuplicates(parseResults(results));
    console.log('Received ' + articles.length + ' unique articles for "' + company + '" from Discovery');
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

function findTickerForCompanyWithName(name) {

  for (var i=0; i<config.companies.length; i++) {
    var company = config.companies[i];
    if (name === company.name) {
      return company.ticker;
    }
  }
  return undefined;
}

class StockUpdate {
  
  /**
   * Retrieve new data for the given companies
   * @param {string[]} companies
   */
  run(companies) {

    return new Promise((resolve, reject) => {
      if (!config.configured) {
        console.log("Project is not configured correctly...terminating");
        reject();
      }

      stock_db.search().then((rows)  => {
        var docs = rows.map(function(row) {
          return row.doc;
        });

        //if no companies provided, update all in DB
        if (!companies) {
          companies = docs.map(function(doc) {
            return doc.company;
          });
        }
        if (companies && companies.length > 0) {
          getArticleDataForCompanies(companies, function(articleData, articlesErr) {
            if (!articlesErr) {
              var results = updateStocksData(articleData, docs);
              resolve(results);
            } else {
              console.log(articlesErr);
              reject();
            }
          });
        } else {
          console.log('No companies to update');
          reject();
        }
      }).catch((docsErr) => {
        console.log(docsErr);
        reject();
      });
    });
  }
}

module.exports = StockUpdate;
