
const stockService = require('./services/stock-service');
const Error = require('./models/error');

module.exports = function(app) {

  // server routes
  app.get('/api/stocks', (req, res) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    stockService.getStocks().then((stocks) => {
      res.send(stocks);
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
