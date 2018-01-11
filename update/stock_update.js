
const stock_db = require('./stock_db.js');
const utils = require('./utils.js');
const discovery = require('./discovery.js');

//TODO these should be the companies' tickers
var companies = ['A', 'B', 'C', 'D'];

function findStockDatum(stocks, company) {

  for (var i = 0; i < stocks.length; i++) {
    var stock = stocks[i];
    if (stock.ticker == company) {
      return stock;
    }
  }

  return undefined;
}

function updateStocksData(articleData, stockData) {
  
  for (var i = 0; i < articleData.length; i++) {
    var articleDatum = articleData[i];
    var stockDatum = findStockDatum(stockData, articleDatum.company);
    
    if (stockDatum) {
      stockDatum.history.unshift(articleDatum.article);
    } else {
      stockDatum = {
        ticker: articleDatum.company,
        history: [articleDatum.article]
      };
    }

    //TODO batch insert?
    console.log('Inserting into company ' + articleDatum.company + ' article: ' );
    console.log(articleDatum.article);
    stock_db.insertOrUpdateDoc(stockDatum);
  }
}

function parseArticle(result) {
  return {
    url: result.url,
    sentiment: result.enriched_text.sentiment.document.label,
    date: result.crawl_date
  }
}

function parseResults(results, company) {
  var articleData = [];
  for (var i=0; i<results.length; i++) {
    articleData.push({
      article : parseArticle(results[i]),
      company : company
    });
  }
  return articleData;
}

function getArticleDataForCompany(company, callback) {
  
  var promise = discovery.query(company);
    
  promise.then(function (data) {
    var results = data.results;
    console.log("Received " + results.length + " articles for: " + company);
    callback(undefined, parseResults(results, company));
  }).catch(function (error) {
    callback(error, []);
  });
  
  return promise;
}

function getArticleDataForCompanies(companies, callback) {
  
  var promises = [];
  var articleData = [];
  var errors = [];
  
  for (var i=0; i<companies.length; i++) {
    var company = companies[i];
    console.log("Starting discovery for: " + company);
    var promise = getArticleDataForCompany(company, function(error, articleDataForCompany) {
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
      callback(undefined, articleData);
    }
  }).catch(function(error) {
    if (utils.isFunc(callback)) {
      callback(errors.join(), articleData);
    }
  });
}

function run() {

  getArticleDataForCompanies(companies, function(articlesErr, articleData) {
    if (!articlesErr) {
      stock_db.getDocs(function(docsErr, stockData) {
        if (!docsErr) {
          updateStocksData(articleData, stockData);
        } else {
          console.log(docsErr);
        }
      });
    } else {
      console.log(articlesErr);
    }
  });
}

run();
