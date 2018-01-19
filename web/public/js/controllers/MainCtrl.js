angular.module('MainModule', []).controller('MainController',['$scope', 'StockService', function($scope, StockService) {

  StockService.getStocks().then((stocks) => {
    handleStocks(stocks);
  });

  function addSentiment(stock) {
    stock.recentSentiment = "None";
    if (stock.history && stock.history.length > 0) {
      stock.recentSentiment = stock.history[0].sentiment;
    }
  }

  function handleStocks(stocks) {
    $scope.$apply(() => {
      for (var i=0 ; i<stocks.length; i++) {
        addSentiment(stocks[i]);
      }
      $scope.stocks = stocks;
      updateTable();
    });
  }

  function updateTable() {
    // Call the dataTables jQuery plugin
    $(document).ready(function() {
      $('#dataTable').DataTable();
    });
  }

}]);
