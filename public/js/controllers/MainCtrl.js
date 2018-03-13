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
  $scope.currentCompany = "Your Portfolio";
  $scope.superStockHistory = [];
  $scope.superStockPriceHistory = [];

  var loader = $('#loader');
  loader.hide();

  function setMaxTableHeight(height) {
    $('#dataTable').css('max-height', height + 'px');
  }

  //match the height of the table when the height of the pie chart changes
  function monitorPieChartHeight() {

    var observer = new MutationObserver(function(mutationsList) {
      for (var mutation of mutationsList) {
        if (mutation.type == 'attributes' && mutation.attributeName == "style" || mutation.attributeName == "height") {
          var newHeight = $('#sentimentPieChart').css('height');
          if (newHeight && newHeight.length > 2) {
            //remove 'px'
            newHeight = newHeight.slice(0, -2);
            if (newHeight > 0) {
              setMaxTableHeight(newHeight - 14);
            }
          }
        }
      }
    });

    observer.observe(document.getElementById('sentimentPieChart'),
      {
        attributes: true,
        childList: false
      }
    );
  }

  monitorPieChartHeight();

  $scope.addStock = function() {

    var selectedCompany = $('#selectpicker').find('option:selected').text();

    if (stockExists(selectedCompany)) {
      alert('You are already watching this company.');
      return;
    }

    $scope.currentCompany = selectedCompany;
    var addStockButton = $('#addStockButton');
    addStockButton.hide();
    loader.show();
    if (selectedCompany && selectedCompany.trim() !== '') {

      var showButton = function() {
        addStockButton.show();
        loader.hide();
      };

      var fail = function(error) {
        showButton();
        alert(error.reason);
      };

      var success = function(result) {
        showButton();
        addSentiment(result);
        $scope.$apply(() => {
          var stocks = $scope.stocks;
          stocks.push(result);
          sortStocks(stocks);

          $scope.currentCompany = result.company;
          var newLineChartData = getLineChartData(result.history, result.price_history);
          var newPieChartData = getPieChartData(result.history);

          $scope.myLineChart.data.datasets[0].data = newLineChartData.data;
          $scope.myLineChart.data.datasets[0].label = $scope.currentCompany;
          $scope.myLineChart.data.labels = newLineChartData.labels;
          $scope.myLineChart.data.datasets[0].pointRadius = getPointRadius(newLineChartData.data);
          $scope.myLineChart.data.datasets[0].pointBackgroundColor = getPointColor(newLineChartData.data);
          $scope.myLineChart.data.datasets[0].pointBorderColor = getPointColor(newLineChartData.data);
          $scope.myLineChart.data.datasets[0].pointHoverRadius = getPointRadius(newLineChartData.data);
          $scope.myLineChart.data.datasets[0].pointHoverBackgroundColor = getPointColor(newLineChartData.data);
          //$scope.myLineChart.options.scales.xAxes["0"].ticks.maxTicksLimit = newLineChartData.labels.length;
          $scope.myLineChart.update();

          $scope.myPieChart.data.datasets[0].data = newPieChartData.data;
          $scope.myPieChart.data.labels = newPieChartData.labels;
          $scope.myPieChart.update();

          updateArticles([result]);
        });
      };

      StockService.add(selectedCompany).then((result) => {
        if (result.error) {
          fail(result.error);
        } else {
          success(result);
        }
      }).catch((error) => {
        fail(error);
      });
    }
  };

  $scope.confirmDelete = function(companyName) {
    companyNamePendingDeletion = companyName;
    $('#deletionModal').modal('show');
  };

  $scope.deleteStock = function() {

    $('#deletionModal').modal('hide');

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

    $scope.currentCompany = "your Portfolio";
    var newLineChartData = getLineChartData($scope.superStockHistory, $scope.superStockPriceHistory);
    var newPieChartData = getPieChartData($scope.superStockHistory);

    $scope.myLineChart.data.datasets[0].data = newLineChartData.data;
    $scope.myLineChart.data.datasets[0].label = $scope.currentCompany;
    $scope.myLineChart.data.labels = newLineChartData.labels;
    $scope.myLineChart.data.datasets[0].pointRadius = getPointRadius(newLineChartData.data);
    $scope.myLineChart.data.datasets[0].pointBackgroundColor = getPointColor(newLineChartData.data);
    $scope.myLineChart.data.datasets[0].pointBorderColor = getPointColor(newLineChartData.data);
    $scope.myLineChart.data.datasets[0].pointHoverRadius = getPointRadius(newLineChartData.data);
    $scope.myLineChart.data.datasets[0].pointHoverBackgroundColor = getPointColor(newLineChartData.data);
    $scope.myLineChart.options.scales.xAxes["0"].ticks.maxTicksLimit = newLineChartData.labels.length;
    $scope.myLineChart.update();

    $scope.myPieChart.data.datasets[0].data = newPieChartData.data;
    $scope.myPieChart.data.labels = newPieChartData.labels;
    $scope.myPieChart.update();

    updateArticles($scope.stocks);
  };

  $scope.selectCompany = function($event, stock) {
    tablinks = document.getElementsByClassName("getrow");
    if($event.currentTarget.classList.contains("bg-info")){
      for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" bg-info", "");
      }
      $scope.currentCompany = "your Portfolio";
      var newLineChartData = getLineChartData($scope.superStockHistory, $scope.superStockPriceHistory);
      var newPieChartData = getPieChartData($scope.superStockHistory);
      $scope.myLineChart.data.datasets[0].data = newLineChartData.data;
      $scope.myLineChart.data.datasets[0].label = $scope.currentCompany;
      $scope.myLineChart.data.labels = newLineChartData.labels;
      $scope.myLineChart.data.datasets[0].pointRadius = getPointRadius(newLineChartData.data);
      $scope.myLineChart.data.datasets[0].pointBackgroundColor = getPointColor(newLineChartData.data);
      $scope.myLineChart.data.datasets[0].pointBorderColor = getPointColor(newLineChartData.data);
      $scope.myLineChart.data.datasets[0].pointHoverRadius = getPointRadius(newLineChartData.data);
      $scope.myLineChart.data.datasets[0].pointHoverBackgroundColor = getPointColor(newLineChartData.data);
      $scope.myLineChart.options.scales.xAxes["0"].ticks.maxTicksLimit = newLineChartData.labels.length;
      $scope.myLineChart.update();

      $scope.myPieChart.data.datasets[0].data = newPieChartData.data;
      $scope.myPieChart.data.labels = newPieChartData.labels;
      $scope.myPieChart.update();

      updateArticles($scope.stocks);

    }
    else{
      for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" bg-info", "");
      }
      $event.currentTarget.className += " bg-info";
      $scope.currentCompany = stock.company;
      var newLineChartData = getLineChartData(stock.history, stock.price_history);
      var newPieChartData = getPieChartData(stock.history);

      $scope.myLineChart.data.datasets[0].data = newLineChartData.data;
      $scope.myLineChart.data.datasets[0].label = $scope.currentCompany;
      $scope.myLineChart.data.labels = newLineChartData.labels;
      $scope.myLineChart.data.datasets[0].pointRadius = getPointRadius(newLineChartData.data);
      $scope.myLineChart.data.datasets[0].pointBackgroundColor = getPointColor(newLineChartData.data);
      $scope.myLineChart.data.datasets[0].pointBorderColor = getPointColor(newLineChartData.data);
      $scope.myLineChart.data.datasets[0].pointHoverRadius = getPointRadius(newLineChartData.data);
      $scope.myLineChart.data.datasets[0].pointHoverBackgroundColor = getPointColor(newLineChartData.data);
      $scope.myLineChart.options.scales.xAxes["0"].ticks.maxTicksLimit = newLineChartData.labels.length;
      $scope.myLineChart.update();

      $scope.myPieChart.data.datasets[0].data = newPieChartData.data;
      $scope.myPieChart.data.labels = newPieChartData.labels;
      $scope.myPieChart.update();

      updateArticles([stock]);
    }
  };

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
        return 1;
      }
      return 0;
    });
  }

  /**
   * Sort the articles. The articles are rendered in 2 columns, so we have to split
   * the array by odds and evens to get the most recent to be at the top of both
   * columns rather than the top of the left column and the top of the right column being
   * halfway down the list of most recent
   * @param {article[]} articles
   */
  function sortArticles(articles) {
    var sorted = articles.sort(function(a, b) { return b.sortingDate - a.sortingDate; } );
    var split = [];
    for (var i=0; i<sorted.length; i+=2) {
      split.push(sorted[i]);
    }
    for (var x=1; x<sorted.length; x+=2) {
      split.push(sorted[x]);
    }

    return split;
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
    stock.recentSentiment = 'None';
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
      $scope.updateDate = mostRecent ? mostRecent.toLocaleString() : '';
      var haveStocks = stocks.length > 0;
      $scope.showBanner = !haveStocks;
      sortStocks(stocks);
      $scope.stocks = stocks;
      if (haveStocks) {
        for (var i = 0; i < stocks.length; i++) {
          $scope.superStockHistory.push.apply($scope.superStockHistory, stocks[i].history);
          $scope.superStockPriceHistory.push($scope.superStockPriceHistory, stocks[i].price_history);
        }
        updatePieChart($scope.superStockHistory);
      }
      //space out page updates to prevent lag
      if (haveStocks) {
        $timeout(updateLineChart($scope.superStockHistory, $scope.superStockPriceHistory), 2000);
      }
      $timeout(updateArticles(stocks), 3000);
    });
  }

  /**
   * Handles adding companies to the company dropdown
   * @param {company[]} companies
   */
  function handleCompanies(companies) {
    
    var picker = $('#selectpicker');
    var newItems = '';

    for (var i=0; i<companies.length; i++) {
      var company = companies[i];
      newItems += ('<option data-subtext="' + company.ticker + '">' + company.name + '</option>');
    }
    picker.append(newItems);
    picker.selectpicker('refresh');
  }

  /**
   * Updates the pie chart
   * @param {stock[].history} stocks
   */
  function updatePieChart(history) {
    var pieChartData = getPieChartData(history);
    makeNewPieChart(pieChartData.labels, pieChartData.data);
  }

  function getPieChartData(history){
    var keys = ['Positive', 'Neutral', 'Negative'];

    var dataMap = {};
    for (var x=0; x<keys.length; x++) { dataMap[keys[x].toLowerCase()] = 0; }

    for (var i=0; i<history.length; i++) {dataMap[history[i].sentiment.toLowerCase()] += 1;}

    var data = [];
    for (var y=0; y<keys.length; y++) { data.push(dataMap[keys[y].toLowerCase()]); }

    var pieData = { data: data , labels: keys};
    return pieData;
  }

  function makeNewPieChart(labels,data){
    var ctx = document.getElementById('sentimentPieChart');
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

    for (var i=0; i<stocks.length; i++) {

      var stock = stocks[i];
      var companyArticles = stock.history;
      var companyName = stock.company;

      for (var j=0; j<companyArticles.length; j++) {

        var article = companyArticles[j];
        
        // date pattern "yyyy-MM-dd'T'HH:mm:ssZ";
        var year = article.date.slice(0,4);
        var month = article.date.slice(5,7);
        var day = article.date.slice(8,10);
        var hour = article.date.slice(11,13);
        var minute = article.date.slice(14,16);
        var sortingDate = parseInt(year + month + day + hour + minute);
        var ampm = '' ;

        // assigning AM/PM to date and time
        if (parseInt(hour) >= 12) {
          ampm = 'PM';
          hour = hour - 12;
        } else {
          ampm = 'AM';
        }

        if (hour == 0) {
          hour = 12;
        }

        var articleDate = month + '-' + day + '-' + year + ' at ' + hour + ':' + minute + ampm;
        article.formattedDate = articleDate;
        article.sortingDate = sortingDate;
        article.company = companyName;
      }

      articles = articles.concat(companyArticles);
    }

    $scope.articles = sortArticles(articles);
  }

  /**
   * Updates the line chart
   * @param {stock[].history} stocks
   */
    function updateLineChart(history, price_history) {
    var lineChartData = getLineChartData(history, price_history);
    makeNewChart(lineChartData.labels, lineChartData.data, $scope.currentCompany);
  }

  function getLineChartData(history, price_history) {
    var sentimentMap = {};//has over all sentiment of the day for a particular stock
    var articleCountmap = {};//has article count of the day for a particular stock
    var stockPriceMap = {};
    console.log(price_history);
    for (var i=0; i<history.length; i++) {
      var sentiment = history[i].sentiment.toLowerCase();
      var sentimentInt = 0;
      if (sentiment === 'positive'){
        sentimentInt = 1;
      }
      else if (sentiment === 'negative'){
        sentimentInt = -1;
      }
      
      var index = history[i].date.substr(0,10);
      if(index in sentimentMap){
        sentimentMap[index] += sentimentInt;
        articleCountmap[index] += 1;
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
    for (var y=0; y<labels.length; y++) { data.push((sentimentMap[labels[y]]/articleCountmap[labels[y]])); }
    
    var lineChartData = { data: data , labels: labels};
    return lineChartData;

  }

  function getPointRadius(data){
    var radii = [];
    var constAdd = 2;
    var constMul = 6;
    for(var i=0; i<data.length; i++){ 
      radii.push(Math.abs(data[i]*constMul)+constAdd);}  
    return radii;
  }

  function getPointColor(data){
    var color = [];
    for(var i=0; i<data.length; i++){ 
      if(data[i]>0){
        color_i = '#28a745';
      }else if (data[i]<0) {
        color_i = '#dc3545';
      }else{
        color_i = '#ffc107';
      }
      color.push(color_i); 
    }
    return color;
  }

  function makeNewChart(labels,data, company){
    var ctx = document.getElementById('trendChart');
    $scope.myLineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: company,
          lineTension: 0.0,
          backgroundColor: 'rgba(2,117,216,0)',
          borderColor: 'rgba(2,117,216,1)',
          pointRadius: getPointRadius(data),
          pointBackgroundColor: getPointColor(data),
          pointBorderColor: getPointColor(data),
          pointHoverRadius: getPointRadius(data),
          pointHoverBackgroundColor: getPointColor(data),
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
              maxTicksLimit: 40
            },
            scaleLabel: {
              display: true,
              labelString: 'Time'
            }
          }],
          yAxes: [{
            ticks: {
              min: -2,
              max: +2,
              maxTicksLimit: 10
            },
            gridLines: {
              color: 'rgba(0, 0, 0, .125)',
            },
            scaleLabel: {
              display: true,
              labelString: 'Stock price'
            }
          }],
        },
        legend: {
          display: true
        }
      }
    });
  }

}]);
