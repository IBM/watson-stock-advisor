
const stock_db = require('./stock_db.js');
const utils = require('./utils.js');
const discovery = require('./discovery.js');

//these should be the companies' names
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
    var company = articleDatum.company
    var articles = articleDatum.articles;
    var stockDatum = findStockDatum(stockData, company);
    if (stockDatum) {
      stockDatum.history = articles.concat(stockDatum.history);
    } else {
      stockDatum = {
        ticker : company,
        history : articles
      };
    }
    
    //TODO batch insert?
    console.log('Inserting into company: ' + company + ' articles: ' );
    console.log(articles);
    console.log();
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

function parseResults(results) {
  var articles = [];
  for (var i=0; i<results.length; i++) {
    articles.push(parseArticle(results[i]));
  }
  return articles;
}

function getArticleDataForCompany(company, callback) {
  
  var promise = discovery.query(company);
    
  promise.then(function (data) {
    var results = data.results;
    console.log("Received " + results.length + " articles for: " + company);
    var articles = parseResults(results);
    var data = {
      company : company,
      articles : articles
    }
    callback(undefined, data);
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
