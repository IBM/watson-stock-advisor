angular.module('MainModule').factory('StockService', ['$http', function($http) {

  var service = {};

  service.getStocks = function() {
    return new Promise((resolve, reject) => {
        $http.get('/api/stocks').then((result) => {
          resolve(result.data);
        }).catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  return service;
}]);
