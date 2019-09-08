import { createSelector } from 'reselect';
import get from 'lodash/get';

import {
    portfolioList,
    getSelectedCompany,
} from './portfolio';
import { avDateStringToDate } from './utils';

export const getNewsList = createSelector(
    getSelectedCompany,
    portfolioList,
    (selectedItem, portfolioList) => {
        const history = selectedItem
            ? selectedItem.history
            : portfolioList.reduce((prev, { history, company }) => [
                ...prev,
                ...history.map(newsItem => ({
                    ...newsItem,
                    company,
                })),
            ], []);
        const sortedHistory = history.sort(
            (a, b) => avDateStringToDate(b.date.substr(0, 10)) - avDateStringToDate(a.date.substr(0, 10))
        );
        return sortedHistory.map(item => ({
            image: item.imageURL,
            title: item.title,
            url: item.url,
            params: {
                source: item.source,
                company: item.company || selectedItem.company,
                sentiment: item.sentiment,
            },
            date: new Date().getTime(),
            tags: item.categories,
        }));
    }
);