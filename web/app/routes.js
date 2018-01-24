
const stockService = require('./services/stock-service');
const Error = require('./models/error');

module.exports = function(app) {

  // server routes
  app.get('/api/stocks', (req, res) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    stockService.getStocks().then((stocks) => {
      var prettyStocks = stocks.map((rawStock) => {
        var doc = rawStock.doc;
        return {
          company : doc.ticker,
          ticker : "TODO", //TODO
          history : doc.history || []
        }
      })
      res.send(prettyStocks);
    }).catch((error) => {
      console.log(error);
      res.send(new Error('Stocks Error', 'There was an error retrieving stocks'));
    });
  });

  // frontend routes
  app.get('*', function(req, res) {
    res.sendfile('./public/index.html');
  });

};
