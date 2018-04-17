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

const YOUR_PORTFOLIO = 'Your Portfolio';
const LOADER_ID = 'loader';
const DATA_TABLE_ID = 'dataTable';
const SENTIMENT_PIE_CHART_ID = 'sentimentPieChart';
const ADD_STOCK_BUTTON_ID = 'addStockButton';
const BG_INFO_CLASSNAME = 'bg-info';
const SELECT_PICKER_ID = 'selectpicker';
const TREND_CHART_ID = 'trendChart';

angular.module('MainModule', []).controller('MainController',['$scope', 'StockService', '$timeout', function($scope, StockService, $timeout) {

  var companyNamePendingDeletion = undefined;

  $scope.stocks = [];
  $scope.showBanner = false;
  $scope.currentCompany = YOUR_PORTFOLIO;
  $scope.superStockHistory = [];
  $scope.superStockPriceHistory = [];
  $scope.YOUR_PORTFOLIO = YOUR_PORTFOLIO;

  $scope.isEditing = false;

  var loader = $('#' + LOADER_ID);
  loader.hide();

  function setMaxTableHeight(height) {
    $('#' + DATA_TABLE_ID).css('max-height', height + 'px');
  }

  //match the height of the table when the height of the pie chart changes
  function monitorPieChartHeight() {

    var observer = new MutationObserver(function(mutationsList) {
      for (var mutation of mutationsList) {
        if (mutation.type == 'attributes' && mutation.attributeName == 'style' || mutation.attributeName == 'height') {
          var newHeight = $('#' + SENTIMENT_PIE_CHART_ID).css('height');
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

    observer.observe(document.getElementById(SENTIMENT_PIE_CHART_ID),
      {
        attributes: true,
        childList: false
      }
    );
  }
  monitorPieChartHeight();

  function updateEditButtonText() {
    $scope.editButtonText = $scope.isEditing ? 'Done' : 'Edit';
  }

  updateEditButtonText();

  $scope.toggleEdit = function() {
    $scope.isEditing = !$scope.isEditing;
    updateEditButtonText();
  };

  $scope.editClass = function() {
    return $scope.isEditing ? 'btn-info' : 'btn-danger';
  };

  $scope.prepareForDisplay = function(categories) {
    return categories.join(', ');
  };

  $scope.isStockPriceEmpty = function(){
    if ($scope.currentCompany == YOUR_PORTFOLIO) {
      return $scope.superStockPriceHistory.length <= 0;
    }
    for (var i = 0; i < $scope.stocks.length; i++) {
      var stock = $scope.stocks[i];
      if (stock.company == $scope.currentCompany) {
        if (Object.keys(stock.closing_price_history).length > 0) {
          return false;
        }
      }
    }
    return true;
  };

  $scope.highlightRow = function(index){
    if ($scope.stocks[index].company == $scope.currentCompany) {
      return BG_INFO_CLASSNAME;
    }
  };

  $scope.addStock = function() {

    var selectedCompany = $('#' + SELECT_PICKER_ID).find('option:selected').text();

    if (stockExists(selectedCompany)) {
      alert('You are already watching this company.');
      return;
    }

    $scope.currentCompany = selectedCompany;
    var addStockButton = $('#' + ADD_STOCK_BUTTON_ID);
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
        prepareStockForClient(result);
        $scope.$apply(() => {
          var stocks = $scope.stocks;
          stocks.push(result);
          sortStocks(stocks);
          updateSuperStockData();
          updateAggregateStats();

          $scope.currentCompany = result.company;
          if ($scope.myLineChart) {
            var newLineChartData = getLineChartData(result.history, result.closing_price_history);
            var newPieChartData = getPieChartData(result.history);
            updateVisualizations(newLineChartData, newPieChartData);
            updateArticles([result]);
          } else {
            updatePieChart(result.history);
            $timeout(updateLineChart(result.history, result.closing_price_history), 2000);
            $timeout(updateArticles([result]), 3000);
          }
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

    $scope.currentCompany = YOUR_PORTFOLIO;
    
    updateSuperStockData();
    updateAggregateStats();
    var newLineChartData = getLineChartData($scope.superStockHistory, $scope.superStockPriceHistory);
    var newPieChartData = getPieChartData($scope.superStockHistory);
    updateVisualizations(newLineChartData, newPieChartData);

    updateArticles($scope.stocks);
  };

  $scope.selectCompany = function($event, stock) {

    var isSelected = $event.currentTarget.classList.contains(BG_INFO_CLASSNAME);
    var tablinks = document.getElementsByClassName('getrow');
    for (var i=0; i<tablinks.length; i++) {
      var row = tablinks[i];
      row.className = row.className.replace(' ' + BG_INFO_CLASSNAME, '');
    }
    var newLineChartData;
    var newPieChartData;
    var stocks;
    if (isSelected) {
      $scope.currentCompany = YOUR_PORTFOLIO;
      newLineChartData = getLineChartData($scope.superStockHistory, $scope.superStockPriceHistory);
      newPieChartData = getPieChartData($scope.superStockHistory);
      stocks = $scope.stocks;
    } else {
      $event.currentTarget.className += ' ' + BG_INFO_CLASSNAME;
      $scope.currentCompany = stock.company;
      newLineChartData = getLineChartData(stock.history, stock.closing_price_history);
      newPieChartData = getPieChartData(stock.history);
      stocks = [stock];
    }
    updateAggregateStats();
    updateVisualizations(newLineChartData, newPieChartData);
    updateArticles(stocks);
  };

  StockService.getStocks().then((stocks) => {
    handleStocks(stocks || []);
  });

  StockService.getAllCompanies().then((companies) => {
    handleCompanies(companies);
  });

  function capitalizeFirstLetterOnly(string) {

    if (!string) {
      return string;
    }

    var result = string;
    if (string.length > 0) {
      result = string.charAt(0).toUpperCase();
    }
    if (string.length > 1) {
      result += string.slice(1).toLowerCase();
    }
    return result;
  }

  function updateAggregateStats() {

    var stocks = $scope.stocks;
    if (!stocks || stocks.length == 0) {
      return;
    }

    var selectedCompany = $scope.currentCompany;
    if (selectedCompany && selectedCompany != YOUR_PORTFOLIO) {
      stocks = stocks.filter(function(stock) {
        return stock.company == selectedCompany;
      });
    }

    var sortedDatesFromPriceHistory = function(price_history) {
      return Object.keys(price_history).sort(function(a, b) {
        return avDateStringToDate(b) - avDateStringToDate(a);
      });
    };

    var allStocksHaveDate = function(theDate) {
      for (var x=0; x<stocks.length; x++) {
        var aStock = stocks[x];
        if (!aStock.price_history[theDate]) {
          return false;
        }
      }

      return true;
    };

    var triedDates = [];
    var date; //the most recent date that all stocks have price data for
    for (var y=0; y<stocks.length; y++) {
      var oneStock = stocks[y];
      //sort from most to least recent
      var sortedDates = sortedDatesFromPriceHistory(oneStock.price_history);
      for (var q=0; q<sortedDates.length; q++) {
        var aDate = sortedDates[q];
        if (triedDates.indexOf(aDate) == -1) {
          triedDates.push(aDate);
          if (allStocksHaveDate(aDate)) {
            date = aDate;
            break;
          }
        }
      }
      if (date) {
        break;
      }
    }

    var high = 0;
    var low = 0;
    var open = 0;
    var close = 0;
    if (date) {
      for (var i=0; i<stocks.length; i++) {
        var stock = stocks[i];
        var priceData = stock.price_history;
        var data = priceData[date];
        if (data) {
          high += data.High;
          low += data.Low;
          open += data.Open;
          close += data.Close;
        }
      }
    }

    $scope.high  = '$' + high.toFixed(2);
    $scope.low   = '$' + low.toFixed(2);
    $scope.open  = '$' + open.toFixed(2);
    $scope.close = '$' + close.toFixed(2);
    $scope.aggrStatsDate = date;
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

  function shuffleArray(array) {
    var i = 0;
    var j = 0;
    var temp = null;
  
    for (i = array.length - 1; i > 0; i -= 1) {
      j = Math.floor(Math.random() * (i + 1));
      temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
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

  function prepareStockForClient(stock) {
    addSentiment(stock);
    splitPriceData(stock);
  }

  function addSentiment(stock) {
    stock.recentSentiment = 'None';
    if (stock.history && stock.history.length > 0) {
      stock.recentSentiment = capitalizeFirstLetterOnly(stock.history[0].sentiment);
    }
  }

  function splitPriceData(stock) {

    if (!stock) {
      return;
    }

    var closing_price_history = {};
    var opening_price_history = {};
    var price_history = stock.price_history;
    if (price_history) {
      for (var date in price_history) {
        if (price_history.hasOwnProperty(date)) {
          var data = price_history[date];
          opening_price_history[date] = data['Open'];
          closing_price_history[date] = data['Close'];
        }
      }
    }
    stock.opening_price_history = opening_price_history;
    stock.closing_price_history = closing_price_history;
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
        prepareStockForClient(stock);
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
        updateAggregateStats();
        updateSuperStockData();
        updatePieChart($scope.superStockHistory);
        //space out page updates to prevent lag
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
    
    var picker = $('#' + SELECT_PICKER_ID);
    var newItems = '';

    for (var i=0; i<companies.length; i++) {
      var company = companies[i];
      newItems += ('<option data-subtext="' + company.ticker + '">' + company.name + '</option>');
    }
    picker.append(newItems);
    picker.selectpicker('refresh');
  }

  function updateSuperStockData() {

    $scope.superStockHistory = [];
    $scope.superStockPriceHistory = [];

    var stocks = $scope.stocks;
    if (!stocks) {
      return;
    }

    for (var i=0; i<stocks.length; i++) {
      $scope.superStockHistory.push.apply($scope.superStockHistory, stocks[i].history);
      $scope.superStockPriceHistory.push(stocks[i].closing_price_history);
    }
  }

  function updateVisualizations(newLineChartData, newPieChartData) {

    //update Pie Chart
    if (newPieChartData) {
      $timeout(function() {
        $scope.myPieChart.data.datasets[0].data = newPieChartData.data;
        $scope.myPieChart.data.labels = newPieChartData.labels;
        $scope.myPieChart.update();
      }, 100);
    }

    //update Line Chart
    if (newLineChartData) {
      $timeout(function() {
        $scope.myLineChart.data.datasets[0].data = newLineChartData.price;
        $scope.myLineChart.data.datasets[0].label = $scope.currentCompany;
        $scope.myLineChart.data.labels = newLineChartData.labels;
        $scope.myLineChart.data.datasets[0].pointRadius = getPointRadius(newLineChartData.data);
        $scope.myLineChart.data.datasets[0].pointBackgroundColor = getPointColor(newLineChartData.data);
        $scope.myLineChart.data.datasets[0].pointBorderColor = getPointColor(newLineChartData.data);
        $scope.myLineChart.data.datasets[0].pointHoverRadius = getPointRadius(newLineChartData.data);
        $scope.myLineChart.data.datasets[0].pointHoverBackgroundColor = getPointColor(newLineChartData.data);
        $scope.myLineChart.options.scales.xAxes['0'].ticks.maxTicksLimit = newLineChartData.labels.length;
        $scope.myLineChart.options.scales.yAxes['0'].ticks.max = Math.ceil(Math.max.apply(null, newLineChartData.price)/100)*100;
        $scope.myLineChart.update();
      }, 500);
    }
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
    var ctx = document.getElementById(SENTIMENT_PIE_CHART_ID);
    $scope.myPieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#28a745', '#D3D3D3', '#dc3545'],
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

    $scope.articles = shuffleArray(articles);
  }

  /**
   * Updates the line chart
   * @param {stock[].history} stocks
   */
  function updateLineChart(history, closing_price_history) {
    var lineChartData = getLineChartData(history, closing_price_history);
    makeNewChart(lineChartData.labels, lineChartData.data, lineChartData.price, $scope.currentCompany);
  }

  function getLineChartData(history, closing_price_history) {

    if (Array.isArray(closing_price_history)) {
      var tempPriceHistory = {};
      for (var x=0; x<closing_price_history.length; x++) {
        var singlePriceMap = closing_price_history[x];
        for (var aDate in singlePriceMap) {
          if (singlePriceMap.hasOwnProperty(aDate)) {
            var totalPrice = tempPriceHistory[aDate];
            if (!totalPrice) {
              totalPrice = 0;
            }
            totalPrice += singlePriceMap[aDate];
            tempPriceHistory[aDate] = totalPrice;
          }
        }
      }
      closing_price_history = tempPriceHistory;
    }

    var sortedList = convertPriceMapToList(closing_price_history);

    var sentimentMap = {};//has overall sentiment of the day for a particular stock
    var articleCountmap = {};//has article count of the day for a particular stock
    for (var i=0; i<history.length; i++) {
      var sentiment = history[i].sentiment.toLowerCase();
      var sentimentInt = 0;
      if (sentiment === 'positive'){
        sentimentInt = 1;
      }
      else if (sentiment === 'negative'){
        sentimentInt = -1;
      }
      
      var date = history[i].date.substr(0, 10);
      if (!closing_price_history[date]) {
        var pair = getMatchingDatePair(date, sortedList);
        if (pair) {
          date = pair.date;
        }
      }
      if (date) {
        var index = date;
        if (index in sentimentMap){
          sentimentMap[index] += sentimentInt;
          articleCountmap[index] += 1;
        } else {
          sentimentMap[index] = sentimentInt;
          articleCountmap[index] = 1;
        }
      }
    }

    //distinct dates found in history and sort them
    var labels1 = Object.keys(sentimentMap);
    var labels = labels1.sort(function(a, b) {
      return new Date(a) - new Date(b);
    });

    var prices = [];
    for (var labelInd=0; labelInd<labels.length; labelInd++) {
      var label = labels[labelInd];
      var price = closing_price_history[label];
      prices.push(price.toFixed(2));
    }

    var data = [];
    for (var y=0; y<labels.length; y++) {
      data.push((sentimentMap[labels[y]]/articleCountmap[labels[y]]));
    }

    return { data: data, labels: labels, price: prices};
  }

  /**
   * Converts avDate with format (YYYY-MM-DD) to a Date object
   * @param {string} dateStr
   * @returns {Date}
   */
  function avDateStringToDate(dateStr) {
    var split = dateStr.split('-');
    var year = split[0];
    var month = split[1];
    var day = split[2];
    return new Date(year, month - 1, day);
  }

  /**
   * Converts a price map to a sorted list of date -> price pairs, by dates
   * @param {{}} priceMap
   * @returns {[]}
   */
  function convertPriceMapToList(priceMap) {

    var result = [];
  
    if (!priceMap) {
      return result;
    }
  
    for (var date in priceMap) {
      if (priceMap.hasOwnProperty(date)) {
        result.push({date: date, price: priceMap[date]});
      }
    }
  
    return result.sort(function(a, b) {
      return avDateStringToDate(a.date) - avDateStringToDate(b.date);
    });
  }

  function getMatchingDatePair(date, priceList) {

    if (!date || !priceList) {
      return undefined;
    }

    var realDate = avDateStringToDate(date);
    var numPairs = priceList.length;
    for (var i=0; i<numPairs; i++) {
      var thisPair = priceList[i];
      if (thisPair.date == date) {
        return thisPair;
      }
      var thisDate = avDateStringToDate(thisPair.date);
      if (thisDate > realDate) {
        var previousInd = i - 1;
        if (previousInd >= 0) {
          return priceList[previousInd];
        }
        return thisPair;
      }
    }

    //default to the most recent date if none available and
    //it is earlier than this date
    if (numPairs > 0) {
      var lastPair = priceList[numPairs - 1];
      if (realDate > avDateStringToDate(lastPair.date)) {
        return lastPair;
      }
    }

    return undefined;
  }

  function getPointRadius(data){
    var radii = [];
    var constAdd = 2;
    var constMul = 6;
    for (var i=0; i<data.length; i++) {
      radii.push(Math.abs(data[i] * constMul) + constAdd);
    }
    return radii;
  }

  function getPointColor(data){
    var color = [];
    for (var i=0; i<data.length; i++) {
      var color_i;
      if (data[i] > 0) {
        color_i = '#28a745';
      } else if (data[i] < 0) {
        color_i = '#dc3545';
      } else {
        color_i = '#ffc107';
      }
      color.push(color_i); 
    }
    return color;
  }

  function makeNewChart(labels,data,price,company){
    var ctx = document.getElementById(TREND_CHART_ID);
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
          data: price
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
              maxTicksLimit: 100
            },
            scaleLabel: {
              display: true,
              labelString: 'Time'
            }
          }],
          yAxes: [{
            ticks: {
              min: 0,
              max: Math.ceil(Math.max.apply(null, price)/100)*100,
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
