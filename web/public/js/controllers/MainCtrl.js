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

angular.module('MainModule', []).controller('MainController',['$scope', 'StockService', function($scope, StockService) {

  StockService.getStocks().then((stocks) => {
    handleStocks(stocks);
  });

  function capitalizeFirstLetterOnly(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  function addSentiment(stock) {
    stock.recentSentiment = "None";
    if (stock.history && stock.history.length > 0) {
      stock.recentSentiment = capitalizeFirstLetterOnly(stock.history[0].sentiment);
    }
  }

  function handleStocks(stocks) {
    $scope.$apply(() => {
      for (var i=0 ; i<stocks.length; i++) {
        addSentiment(stocks[i]);
      }
      $scope.stocks = stocks;
      updateTable();
      updatePieChart(stocks);
    });
  }

  function updateTable() {
    // Call the dataTables jQuery plugin
    $(document).ready(function() {
      $('#dataTable').DataTable();
    });
  }

  function updatePieChart(stocks) {
    var ctx = document.getElementById("sentimentPieChart");

    var keys = ["Positive", "Neutral", "Negative"]

    var dataMap = {};
    for (var x=0; x<keys.length; x++) { dataMap[keys[x].toLowerCase()] = 0; }

    for (var i=0; i<stocks.length; i++) {
      dataMap[stocks[i].recentSentiment.toLowerCase()] += 1;
    }
    var data = [];
    for (var y=0; y<keys.length; y++) { data.push(dataMap[keys[y].toLowerCase()]) }

    var myPieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: keys,
        datasets: [{
          data: data,
          backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
        }],
      },
    });
  }

}]);
