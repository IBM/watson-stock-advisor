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

  var companyNamePendingDeletion = undefined;

  $scope.stocks = [];

  var loader = $('#loader');
  loader.hide();

  $scope.addStock = function() {
    var addStockButton = $('#addStockButton');
    addStockButton.hide();
    loader.show();
    var selectedCompany = $("#selectpicker").find("option:selected").text();
    if (selectedCompany && selectedCompany.trim() !== '') {
      StockService.add(selectedCompany).then((result) => {
        addStockButton.show();
        loader.hide();
        $scope.$apply(() => {
          var stocks = $scope.stocks;
          stocks.push(result);
          sortStocks(stocks);
        });
      }).catch((error) => {
        addStockButton.show();
        loader.hide();
        alert(error);
      })
    }
  }

  $scope.confirmDelete = function(companyName) {
    companyNamePendingDeletion = companyName;
    $('#deletionModal').modal('show')
  }

  $scope.deleteStock = function() {

    $('#deletionModal').modal('hide')

    if (!companyNamePendingDeletion) {
      return;
    }

    StockService.delete(companyNamePendingDeletion);
    var stocks = $scope.stocks;
    for (var i=0; i<stocks.length; i++) {
      var stock = stocks[i];
      if (stock.company === companyNamePendingDeletion) {
        stocks.splice(i, 1);
        break;
      }
    }
    companyNamePendingDeletion = undefined;
  }

  StockService.getStocks().then((stocks) => {
    handleStocks(stocks);
  });

  StockService.getAllCompanies().then((companies) => {
    handleCompanies(companies);
  });

  function capitalizeFirstLetterOnly(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  function sortStocks(stocks) {
    stocks.sort(function(a, b) {
      if (a.company < b.company) {
        return -1;
      } else if (a.company > b.company) {
        return 1
      }
      return 0;
    });
  }

  function addSentiment(stock) {
    stock.recentSentiment = "None";
    if (stock.history && stock.history.length > 0) {
      stock.recentSentiment = capitalizeFirstLetterOnly(stock.history[0].sentiment);
    }
  }

  /**
   * Handles all page population with stock data
   * @param {stock[]} stocks
   */
  function handleStocks(stocks) {
    $scope.$apply(() => {
      for (var i=0 ; i<stocks.length; i++) {
        addSentiment(stocks[i]);
      }
      sortStocks(stocks)
      $scope.stocks = stocks;
      updateTable();
      updatePieChart(stocks);
      updateLineChart(stocks);
      updateArticles(stocks);
    });
  }

  /**
   * Handles all page population with stock data
   * @param {stock[]} stocks
   */
  function handleCompanies(companies) {
    
    var picker = $("#selectpicker");
    var newItems = '';

    for (var i=0; i<companies.length; i++) {
      var company = companies[i];
      newItems += ('<option data-subtext="' + company.ticker + '">' + company.name + '</option>');
    }
    picker.append(newItems);
    picker.selectpicker('refresh');
  }

  /**
   * Updates the table
   */
  function updateTable() {
    // Call the dataTables jQuery plugin
    $(document).ready(function() {
      $('#dataTable').DataTable();
    });
  }

  /**
   * Updates the pie chart
   * @param {stock[]} stocks
   */
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


  function updateArticles(stocks) {

    var articles = [];

    for (var i = 0; i < stocks.length; i++) {

        companyArticles = stocks[i].history; 
        companyName = stocks[i].company;

        for (var j = 0; j < companyArticles.length; j++) {
          
          //console.log(companyArticles[j]);
          // TODO get source and article title from discovery 

          // date pattern "yyyy-MM-dd'T'HH:mm:ssZ";
          var month = companyArticles[j].date.slice(5,7);
          var day = companyArticles[j].date.slice(8,10); 
          var year = companyArticles[j].date.slice(0,4);  
          var hour = companyArticles[j].date.slice(11,13);
          var minute = companyArticles[j].date.slice(14,16);
          var ampm = "" ; 

          // assigning AM/PM to date and time 
          if (parseInt(hour) >= 12) {
            ampm = "PM"; 
            hour = hour - 12; 
          }
          else {
            ampm = "AM"
          }

          if (hour == 0) {
            hour = 12; 
          }

          var articleDate = month + "-" + day + "-" + year + " at " + hour + ":" + minute + ampm;
          companyArticles[j].formattedDate = articleDate; 
          companyArticles[j].company = companyName; 
        }

        articles = articles.concat(stocks[i].history);
    } 

    // TODO: sorting articles by date 
    $scope.articles = articles; 

  }

  /**
   * Updates the line chart
   * @param {stock[]} stocks
   */
  function updateLineChart(stocks) {
    var ctx = document.getElementById("trendChart");
    var history = stocks[0].history;

    //has over all sentiment of the day for a particular stock
    var sentimentMap = {};
    //has article count of the day for a particular stock
    var articleCountmap = {};

    for (var i=0; i<history.length; i++) {
      var sentiment = history[i].sentiment.toLowerCase();
      var sentimentInt = 0;
      if (sentiment === "positive"){
        sentimentInt = 1;
      }
      else if (sentiment === "negative"){
        sentimentInt = -1;
      }
      
      var index = history[i].date.substr(0,10);
      if(index in sentimentMap){
        sentimentMap[index] += sentimentInt;
        articleCountmap[index] += 1
      }
      else{
        sentimentMap[index] = sentimentInt;
        articleCountmap[index] = 1;
      }
    }

    //distinct dates found in history
    var labels1 = Object.keys(sentimentMap);
    var labels = labels1.sort(function(a, b) {
      return new Date(a) - new Date(b);
    });


    var data = [];
    for (var y=0; y<labels.length; y++) { data.push((sentimentMap[labels[y]]/articleCountmap[labels[y]])) }
    
    var myLineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: "Sessions",
          lineTension: 0.3,
          backgroundColor: "rgba(2,117,216,0.2)",
          borderColor: "rgba(2,117,216,1)",
          pointRadius: 5,
          pointBackgroundColor: "rgba(2,117,216,1)",
          pointBorderColor: "rgba(255,255,255,0.8)",
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgba(2,117,216,1)",
          pointHitRadius: 20,
          pointBorderWidth: 2,
          data: data,
        }],
      },
      options: {
        scales: {
          xAxes: [{
            time: {
              unit: 'date'
            },
            gridLines: {
              display: false
            },
            ticks: {
              maxTicksLimit: labels.length
            }
          }],
          yAxes: [{
            ticks: {
              min: -2,
              max: +2,
              maxTicksLimit: 10
            },
            gridLines: {
              color: "rgba(0, 0, 0, .125)",
            }
          }],
        },
        legend: {
          display: false
        }
      }
    });
  }

}]);
