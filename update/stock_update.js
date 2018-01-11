
var stock_db = require('./stock_db.js');
var utils = require('./utils.js');

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

function getArticleDataForCompanies(companies, callback) {

  //TODO use Watson discovery API to retrieve articles based on companies
  var articleData = [];
  var sentiments = ['positive', 'negative', 'neutral'];
  for (var i = 0; i < companies.length; i++) {
    articleData.push({
      article: {
        url: 'http://example.not-real.com/article' + (i + 1),
        sentiment: sentiments[i % sentiments.length],
        date: new Date(),
      },
      company: companies[i]
    });
  }

  if (utils.isFunc(callback)) {
    callback(undefined, articleData);
  }
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
