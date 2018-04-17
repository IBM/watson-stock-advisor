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
const alphaV = config.configured && require('./alphaVantage');
const request = require('request');
const cheerio = require('cheerio');

/**
 * Sorts and returns the articles from most to least recent by date
 * @param {article[]} articles
 * @returns {article[]} - the sorted articles
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
 * @returns {boolean} - True if the article is found, false otherwise
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
 * Finds the image for the given article
 * @param {article} article
 * @returns {promise} - The result will be of the form {url: url, imageURL: imageURL},
 * or undefined if no image found
 */
function getImageForArticle(article) {
  return new Promise((res, rej) => {
    var url = article.url;
    request(url, function(error, response, html) {

      var fail = function() {
        console.log('no image url found for article with url: (' + url + ')');
        res();
      };

      if (!error){
        var $ = cheerio.load(html);
        var imgSrc = $.root().find('img').attr('src');
        if (!imgSrc) {
          imgSrc = $('body').find('img').attr('src');
        }
        if (imgSrc) {
          var imageURL;
          var httpURL = utils.extractHTTPURL(imgSrc);
          if (httpURL) {
            imageURL = httpURL;
          } else {
            //in this case, imgSrc *should* be a relative path
            var domain = utils.extractDomain(url);
            imageURL = domain + '/' + (imgSrc.startsWith('/') ? imgSrc.slice(1) : imgSrc);
          }
          console.log('image url (' + imageURL + ') found for article with url: (' + url + ')');
          res({url: url, imageURL: imageURL});
        } else {
          fail();
        }
      } else {
        rej();
      }
    });
  });
}

/**
 * Try to find and add image urls to each article
 * @param {article[]} articles
 */
function getImages(articles) {

  return new Promise((resolve) => {
    var catches = [];

    for (var i=0; i<articles.length; i++) {
      var article = articles[i];
      var promise = getImageForArticle(article);
      catches.push(promise.catch(e => {
        console.log('Error finding img url for ');
        return e;
      }));
    }

    //we wait here until all attempts are finished.
    //we may not be able to retrieve image urls for all articles...
    //and that's ok. since we are Promise.all-ing caught promises,
    //we allow any outstanding promises to continue even if one of them fails.
    //the catch block here should never fire, but we place it for good measure
    var results = [];
    Promise.all(catches).then((tempResults) => {
      for (var x=0; x<tempResults.length; x++) {
        var tempRes = tempResults[x];
        if (tempRes && tempRes.url) {
          results.push(tempRes);
        }
      }
      resolve(results);
    }).catch((error) => {
      console.log(error);
      resolve(results);
    });
  });
}

/**
 * Inserts the new articles for the given stockDatum
 * @param {stock} stockDatum - The existing stock datum
 * @param {articles[]} newArticles - The article to be added
 * @param {} updatedPriceHistory - The latest retrieved stock prices
 * @param {function} callback - the function to call on completion
 */
function insertNewData(stockDatum, newArticles, updatedPriceHistory, callback) {
  getImages(newArticles).then((imgResults) => {
    for (var x=0; x<imgResults.length; x++) {
      var imgResult = imgResults[x];
      for (var y=0; y<newArticles.length; y++) {
        var newArtic = newArticles[y];
        if (newArtic.url === imgResult.url) {
          newArtic.imageURL = imgResult.imageURL;
          break;
        }
      }
    }
    var company = stockDatum.company;
    if (newArticles.length > 0) {
      var existingArticles = stockDatum.history || [];
      var updatedArticles = sortArticles(existingArticles.concat(newArticles));
      if (updatedArticles.length > config.MAX_ARTICLES_PER_COMPANY) {
        console.log('"' + company + '" has exceeded article max of ' + config.MAX_ARTICLES_PER_COMPANY + '...');
        console.log('Removing ' + (updatedArticles.length - config.MAX_ARTICLES_PER_COMPANY) + ' oldest article(s) from "' + company + '" history...');
        updatedArticles = updatedArticles.slice(0, config.MAX_ARTICLES_PER_COMPANY);
      }
      stockDatum.history = updatedArticles;
      console.log('Inserting into company "' + company + '" articles: ' );
      console.log(newArticles);
    } else {
      console.log('No new articles to insert into "' + company + '"');
    }
    //combine the existing price history with the newly retrieved history
    var newHistory = stockDatum.price_history || {};
    var pricesUpdated = false;
    for (var date in updatedPriceHistory) {
      if (updatedPriceHistory.hasOwnProperty(date)) {
        if (!newHistory[date]) {
          pricesUpdated = true;
          newHistory[date] = updatedPriceHistory[date];
        }
      }
    }
    stockDatum.price_history = newHistory;

    //TODO batch insert?
    if (pricesUpdated || newArticles.length > 0) {
      stock_db.insertOrUpdate(stockDatum).catch((error) => {
        console.log(error);
      });
    }
    callback();
  }).catch(() => {
    callback();
  });
}

/**
 * Retrieves the latest price history for the stock and
 * combines it with the existing history
 * @param {stock} stockDatum
 * @returns priceMap - The result is the new price history, if successful
 */
function getLatestStockPrices(stockDatum) {

  return new Promise((resolve, reject) => {
    if (!stockDatum || !stockDatum.ticker) {
      reject();
      return;
    }

    var ticker = stockDatum.ticker;
    console.log('Beginning stock price update for ' + ticker);

    alphaV.getDataHistoryForTicker(ticker).then((updatedHistory) => {
      resolve(updatedHistory);
    }).catch((error) => {
      reject(error);
    });
  });
}

/*
 * Updates the database with the article data. New (unique) articles
 * are inserted into the database. Duplicates are removed. The articles
 * are sorted from most to least recent for each before updating DB.
 * @param {article[]} articleData
 * @param {stocks[]} stockData
 * @returns {stocks[]} - the updated results
 */
function updateStocksData(articleData, stockData) {
  
  var results = stockData;
  var catches = [];

  for (var i=0; i<articleData.length; i++) {
    
    var promise = new Promise((res) => {
      var articleDatum = articleData[i];
      var company = articleDatum.company;
      console.log('Beginning article insertion for "' + company + '"');
      var stockDatum = utils.findStockDatum(stockData, company);
      if (!stockDatum) {
        stockDatum = {
          company : company,
          ticker  : findTickerForCompanyWithName(company) || 'No Ticker Found',
          history : []
        };
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

      getLatestStockPrices(stockDatum).then((newPriceHistory) => {
        console.log('stock price retrieval successful for ' + stockDatum.ticker);
        insertNewData(stockDatum, newArticles, newPriceHistory, function() {
          res();
        });
      }).catch((error) => {
        console.log('stock price retrieval failed:');
        console.log(error);
        insertNewData(stockDatum, newArticles, {}, function() {
          res();
        });
      });
    });

    catches.push(promise.catch(e => {
      console.log('Error inserting stock data for ' + articleData[i].company);
      return e;
    }));
  }

  return new Promise((resolve) => {
    Promise.all(catches).then(() => {
      resolve(results);
    }).catch((error) => {
      console.log(error);
      resolve(results);
    });
  });
}

/**
 * Parses a single discovery result for the relevant data
 * @param {discoveryResult} result
 * @returns {object} - a simplified JSON object with relevant data
 */
function parseArticle(result) {
  
  var parseCategories = function(cats) {

    var categories = [];
    if (!cats || cats.length == 0) {
      return categories;
    }    
    
    for (var i=0; i<cats.length; i++) {
      var rawLabel = cats[i].label;
      var lastSlashIndex = rawLabel.lastIndexOf('/');
      var category = lastSlashIndex == -1 ? rawLabel : rawLabel.substring(lastSlashIndex + 1);
      categories.push(category);
    }

    return categories;
  };
  
  return {
    url: result.url,
    sentiment: result.enriched_text.sentiment.document.label,
    categories: parseCategories(result.enriched_text.categories),
    date: result.crawl_date,
    title: result.title,
    source: result.forum_title
  };
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
 * @returns {promise} - The promise for the request to Watson Discovery
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
  };

  var promise = discovery.query(company);
    
  promise.then(function (data) {
    var results = data.results;
    var articles = filterDuplicates(parseResults(results));
    console.log('Received ' + articles.length + ' unique articles for "' + company + '" from Discovery');
    var theArticleData = {
      company : company,
      articles : articles
    };
    callback(theArticleData);
  }).catch(function (error) {
    callback({}, error);
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

  var done = function() {
    if (utils.isFunc(callback)) {
      if (errors.length == 0) {
        callback(articleData);
      } else {
        callback(articleData, errors.join());
      }
    }
  };
  
  Promise.all(promises).then(function() {
    done();
  }).catch(function() {
    done();
  });
}

/**
 * Finds the corresponding ticker for a company with the given name.
 * @param {name} name
 * @returns {string} - the ticker, or undefined if no such company exists
 */
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
   * @returns {promise}
   */
  run(companies) {

    return new Promise((resolve, reject) => {
      if (!config.configured) {
        console.log('Project is not configured correctly...terminating');
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
              updateStocksData(articleData, docs).then((results) => {
                resolve(results);
              }).catch((results) => {
                //updateStocksData never rejects, so resolving here is a failsafe
                resolve(results);
              });
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
