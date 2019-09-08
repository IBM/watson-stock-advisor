import { createSelector } from 'reselect';
import get from 'lodash/get';

import {
    getPieChartData,
    getLineChartData,
    getSentimentByValue,
    avDateStringToDate,
} from './utils';

const portfolio = state => state.portfolio;

export const portfolioList = createSelector(
    portfolio,
    items => items.portfolioList,
);

export const portfolioTable = createSelector(
    portfolioList,
    items => items.map(item => ({
        id: item.ticker,
        title: item.company,
        sentiment: get(item, ['history', 0, 'sentiment'], 'neutral'),
    })),
)

export const selectedShareId = createSelector(
    portfolio,
    portfolio => portfolio.selectedShareId,
);

export const getSelectedCompany = createSelector(
    portfolioList,
    selectedShareId,
    (items, selectedShareId) => {
        const selectedItem = items.find(({ ticker }) => selectedShareId === ticker);
        if (selectedItem) {
            return selectedItem;
        }
        return undefined;
    }
)

export const getSelectedCompanyName = createSelector(
    getSelectedCompany,
    (selectedItem) => selectedItem ? selectedItem.company : 'Your portfolio',
)

export const getHistory = createSelector(
    getSelectedCompany,
    portfolioList,
    (selectedItem, portfolioList) => selectedItem
        ? selectedItem.history
        : portfolioList.reduce((prev, cur) => ([...prev, ...cur.history]), []),
);

export const getPieChart = createSelector(
    getHistory,
    (history) => getPieChartData(history),
);

export const getClosingPriceHistory = createSelector(
    getSelectedCompany,
    portfolioList,
    (selectedItem, portfolioList) => selectedItem
        ? Object.keys(selectedItem.price_history).reduce(
            (prev, key) => ({
                ...prev,
                [key]: selectedItem.price_history[key].Close,
            }),
            {}
        )
        : portfolioList.map(
            ({ price_history }) => Object.keys(price_history).reduce(
                (prev, key) => ({
                    ...prev,
                    [key]: price_history[key].Close,
                }),
                {},
            )
        ),
);

export const getTrends = createSelector(
    getHistory,
    getClosingPriceHistory,
    (history, closingHistory) => {
        const {
            data,
            labels,
            prices,
        } = getLineChartData(history, closingHistory);

        const trends = labels.map((label, i) => ({
            date: label,
            price: prices[i],
            sentiment: getSentimentByValue(data[i]),
            value: data[i],
        }));

        return trends;
    }
);

export const getLastDate = createSelector(
    getHistory,
    history => {
        const sortedDateStrList = history
            .map(({ date }) => date.substr(0, 10))
            .sort((a, b) => avDateStringToDate(b) - avDateStringToDate(a));
        if (sortedDateStrList.length) {
            const [year, month, day] = sortedDateStrList[0].split('-');
            return new Date(year, month - 1, day);
        }
        return new Date();
    },
);

export const getLastPriceHistory = createSelector(
    getSelectedCompany,
    portfolioList,
    (selectedItem, portfolioList) => {
        if (selectedItem) {
            const dates = Object.keys(selectedItem.price_history);
            const lastDate = dates[dates.length - 1];
            return selectedItem.price_history[lastDate];
        }
        return portfolioList.map(item => {
            const dates = Object.keys(item.price_history);
            const lastDate = dates[dates.length - 1];
            return item.price_history[lastDate];
        }).reduce((prev, cur) => {
            if (Object.keys(prev).length) {
                return Object.keys(prev).reduce((sum, key) => ({
                    ...sum,
                    [key]: prev[key] + cur[key],
                }), {});
            }
            return { ...cur };
        }, {});
    }
);