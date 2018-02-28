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

angular.module('MainModule', []).controller('MainController',['$scope', 'StockService', '$timeout', function($scope, StockService, $timeout) {

  var companyNamePendingDeletion = undefined;

  $scope.stocks = [];
  $scope.showBanner = false;

  var loader = $('#loader');
  loader.hide();

  $scope.addStock = function() {

    var selectedCompany = $("#selectpicker").find("option:selected").text();

    if (stockExists(selectedCompany)) {
      alert('You are already watching this company.');
      return;
    }

    var addStockButton = $('#addStockButton');
    addStockButton.hide();
    loader.show();
    if (selectedCompany && selectedCompany.trim() !== '') {
      StockService.add(selectedCompany).then((result) => {
        addStockButton.show();
        loader.hide();
        addSentiment(result);
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

  $scope.selectCompany = function(stock) {
    var newLineChartData = getLineChartData(stock);
    $scope.myLineChart.data.datasets[0].data = newLineChartData.data;
    $scope.myLineChart.data.labels = newLineChartData.labels;
    $scope.myLineChart.update();

    var newPieChartData = getPieChartData(stock);
    $scope.myPieChart.data.datasets[0].data = newPieChartData.data;
    $scope.myPieChart.data.labels = newPieChartData.labels;
    $scope.myPieChart.update();
  }

  StockService.getStocks().then((stocks) => {
    handleStocks(stocks || []);
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

  function stockExists(companyName) {

    var stocks = $scope.stocks;
    for (var i=0; i<stocks.length; i++) {
      if (stocks[i].company === companyName) {
        return true;
      }
    }

    return false;
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
      var mostRecent = undefined;
      for (var i=0 ; i<stocks.length; i++) {
        var stock = stocks[i];
        addSentiment(stock);
        for (var x=0; x<stock.history.length; x++) {
          var article = stock.history[x];
          var date = new Date(article.date);
          if (!mostRecent || (date.getTime() > mostRecent.getTime())) {
            mostRecent = date;
          }
        }
      }
      $scope.updateDate = mostRecent ? mostRecent.toLocaleString() : "";
      var haveStocks = stocks.length > 0;
      $scope.showBanner = !haveStocks;
      sortStocks(stocks)
      $scope.stocks = stocks;
      if (haveStocks) {
        updatePieChart(stocks[0]);
      }
      //space out page updates to prevent lag
      $timeout(updateTable(), 1000);
      if (haveStocks) {
        $timeout(updateLineChart(stocks[0]), 2000);
      }
      $timeout(updateArticles(stocks), 3000);
    });
  }

  /**
   * Handles adding companies to the company dropdown
   * @param {company[]} companies
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
  function updatePieChart(stock) {
    var pieChartData = getPieChartData(stock);
    makeNewPieChart(pieChartData.labels, pieChartData.data);
  }

  function getPieChartData(stock){
    var keys = ["Positive", "Neutral", "Negative"]

    var dataMap = {};
    for (var x=0; x<keys.length; x++) { dataMap[keys[x].toLowerCase()] = 0; }

    var history = stock.history;
    for (var i=0; i<history.length; i++) {dataMap[history[i].sentiment.toLowerCase()] += 1}

    var data = [];
    for (var y=0; y<keys.length; y++) { data.push(dataMap[keys[y].toLowerCase()]) }

    var pieData = { data: data , labels: keys}
    return pieData;
  }

  function makeNewPieChart(labels,data){
    var ctx = document.getElementById("sentimentPieChart");
    $scope.myPieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
        }],
      },
    });
  }

  /**
   * Updates the articles displayed 
   * @param {stock[]} stocks
   */
  function updateArticles(stocks) {

    var articles = [];

    for (var i = 0; i < stocks.length; i++) {

        companyArticles = stocks[i].history; 
        companyName = stocks[i].company;

        for (var j = 0; j < companyArticles.length; j++) {
          
          //console.log(companyArticles[j]); 

          // date pattern "yyyy-MM-dd'T'HH:mm:ssZ"; 
          var year = companyArticles[j].date.slice(0,4);
          var month = companyArticles[j].date.slice(5,7);
          var day = companyArticles[j].date.slice(8,10);  
          var hour = companyArticles[j].date.slice(11,13);
          var minute = companyArticles[j].date.slice(14,16);
          var sortingDate = parseInt(year + month + day + hour + minute); 
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
          companyArticles[j].sortingDate = sortingDate; 
          companyArticles[j].company = companyName; 
        }

        articles = articles.concat(stocks[i].history);
    } 

    articles = articles.sort(function(a, b){return b.sortingDate - a.sortingDate}); 
    $scope.articles = articles; 

  }

  /**
   * Updates the line chart
   * @param {stock[]} stocks
   */
  function updateLineChart(stock) {
    var lineChartData = getLineChartData(stock)
    makeNewChart(lineChartData.labels, lineChartData.data);
  }

  function getLineChartData(stock) {
    var history = stock.history;
    var sentimentMap = {};//has over all sentiment of the day for a particular stock
    var articleCountmap = {};//has article count of the day for a particular stock

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

    //distinct dates found in history and sort them
    var labels1 = Object.keys(sentimentMap);
    var labels = labels1.sort(function(a, b) {
      return new Date(a) - new Date(b);
    });

    var data = [];
    for (var y=0; y<labels.length; y++) { data.push((sentimentMap[labels[y]]/articleCountmap[labels[y]])) }
    
    var lineChartData = { data: data , labels: labels}
    return lineChartData;

  }

  function makeNewChart(labels,data){
    var ctx = document.getElementById("trendChart");
    $scope.myLineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: "Sentiment value per day",
          lineTension: 0.0,
          backgroundColor: "rgba(2,117,216,0)",
          borderColor: "rgba(2,117,216,1)",
          pointRadius: 5,
          pointBackgroundColor: "rgba(2,117,216,1)",
          pointBorderColor: "rgba(255,255,255,0.8)",
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgba(2,117,216,1)",
          pointHitRadius: 5,
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
