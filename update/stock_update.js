//---CONFIGURE AUTHENTICATION HERE--------------------
var CLOUDANT_KEY      = 'XXXXXXXXX';
var CLOUDANT_PASSWORD = 'YYYYYYYYY';
var CLOUDANT_ACCESS   = 'someurl-bluemix.cloudant.com'
var DB_NAME = 'DB_NAME';
//----------------------------------------------------

var Cloudant = require('cloudant');

var cloudant = Cloudant({
    account: CLOUDANT_ACCESS,
    key: CLOUDANT_KEY,
    password: CLOUDANT_PASSWORD
});
var db = cloudant.db.use(DB_NAME);

//TODO these should be the companies' tickers
var companies = ['A', 'B', 'C', 'D'];

function isFunc(func) {
    return typeof func == 'function';
}

function getDocs(callback) {
    db.list({
        //this field is needed to return all doc data
        include_docs: true
    }, function(err, data) {
        if (isFunc(callback)) {
            var docs = data.rows.map(function(row) {
                return row.doc;
            });
            callback(err, docs);
        }
    });
}

//include _id and _rev of existing doc in the doc to perform an update
function insertOrUpdateDoc(doc, callback) {

    db.insert(doc, function(err, body, header) {
        if (err) {
            console.log('insertion failed: ' + err.message);
        } else if (isFunc(callback)) {
            callback(body, header);
        }
    });
}

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
        insertOrUpdateDoc(stockDatum);
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

    if (isFunc(callback)) {
        callback(undefined, articleData);
    }
}

function run() {

    getArticleDataForCompanies(companies, function(articlesErr, articleData) {
        if (!articlesErr) {
            getDocs(function(docsErr, stockData) {
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
