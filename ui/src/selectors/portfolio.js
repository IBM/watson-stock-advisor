import { createSelector } from 'reselect';
import get from 'lodash/get';

const portfolio = state => state.portfolio;

const portfolioList = createSelector(
    portfolio,
    items => items.portfolioList,
)

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