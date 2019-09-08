export const getPieChartData = (history) => {
    const keys = ['positive', 'neutral', 'negative'];
    const dataMap = keys.reduce((prev, cur) => ({
        ...prev,
        [cur]: 0
    }), {});

    history.forEach(historyPoint => dataMap[historyPoint.sentiment] += 1);

    return Object.keys(dataMap).map(sentiment => ({
        name: sentiment,
        value: dataMap[sentiment],
    }));
}

const getPlateClosingPriceHistory = (closingPriceHistory) => {
    if (Array.isArray(closingPriceHistory)) {
        return closingPriceHistory.reduce((prev, singlePriceMap) => {
            const res = { ...prev };
            Object.keys(singlePriceMap).forEach(aDate => {
                const totalPrice = res[aDate] || 0;
                res[aDate] = totalPrice + singlePriceMap[aDate];
            });
            return res;
        }, {});
    }
    return {
        ...closingPriceHistory,
    };
};

export const avDateStringToDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return new Date(year, month - 1, day);
};

const convertPriceMapToList = (priceMap) => {
    if (!priceMap) {
        return [];
    }

    return Object.keys(priceMap).map(date => ({
        date: date,
        price: priceMap[date],
    })).sort((a, b) => {
        return avDateStringToDate(a.date) - avDateStringToDate(b.date);
    });
};

const getMatchingDatePair = (date, priceList) => {
    if (!date || !priceList) {
        return undefined;
    }

    const realDate = avDateStringToDate(date);
    const numPairs = priceList.length;
    for (var i = 0; i < numPairs; i++) {
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

export const getLineChartData = (history, notPreparedClosingPriceHistory) => {
    const closingPriceHistory = getPlateClosingPriceHistory(notPreparedClosingPriceHistory);

    var sortedList = convertPriceMapToList(closingPriceHistory);

    const sentimentMap = {};//has overall sentiment of the day for a particular stock
    const articleCountmap = {};//has article count of the day for a particular stock
    for (let i = 0; i < history.length; i++) {
        const sentiment = history[i].sentiment.toLowerCase();
        let sentimentInt = 0;
        if (sentiment === 'positive') {
            sentimentInt = 1;
        }
        else if (sentiment === 'negative') {
            sentimentInt = -1;
        }

        var date = history[i].date.substr(0, 10);
        if (!closingPriceHistory[date]) {
            var pair = getMatchingDatePair(date, sortedList);
            if (pair) {
                date = pair.date;
            }
        }
        if (date) {
            var index = date;
            if (index in sentimentMap) {
                sentimentMap[index] += sentimentInt;
                articleCountmap[index] += 1;
            } else {
                sentimentMap[index] = sentimentInt;
                articleCountmap[index] = 1;
            }
        }
    }

    //distinct dates found in history and sort them
    const labels = Object.keys(sentimentMap).sort((a, b) => new Date(a) - new Date(b));

    const prices = labels.map(label => closingPriceHistory[label].toFixed(2));

    const data = labels.map(label => (sentimentMap[label] / articleCountmap[label]));

    return {
        data,
        labels,
        prices,
    };
}

export const getSentimentByValue = (value) => {
    if (value === 0) {
        return 'neutral';
    }
    if (value > 0) {
        return 'positive';
    }

    return 'negative';
}