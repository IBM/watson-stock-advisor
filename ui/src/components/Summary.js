import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { connect } from 'react-redux';
import { isMobile } from 'react-device-detect';

import { colors } from '../constants/style';

import {
    getLastDate,
    getLastPriceHistory,
} from '../selectors/portfolio';

const priceItemStyle = `
    &:first-child {
        font-size: 16px;
        font-weight: 600;
        text-transform: uppercase;
        color: ${colors.white};
    }

    &:last-child {
        font-size: 12px;
        text-transform: capitalize;
        color: ${colors.textYellow};
    }
`;

const Container = styled.summary`
    background-color: ${colors.darkGrey};
    ${
        isMobile ? `
            width: calc(100% + 20px);
            height: 70px;
            position: relative;
            left: -10px;
        ` : `
            position: absolute;
            top: 20px;
            right: 0;
            width: 130%;
            height: 100px;
        `
    }
    
    box-shadow: 0px 2px 7px 0px rgba(156,156,156,1);

    display: flex;
    flex-direction: ${isMobile ? 'column' : 'row'};
    justify-content: space-evenly;
    align-items: center;

    > div {
        display: flex;
        flex-direction: ${isMobile ? 'row' : 'column'};
        align-items: center;
        padding: 0 10px;

        ${isMobile ? `
        &.date {
            align-self: start;

            > div {
                font-size: 12px !important;
                text-transform: capitalize !important;
                color: ${colors.textYellow} !important;
                margin: 0 !important;

                &:last-child {
                    margin-left: 5px !important;
                }
            }
        }

        &.prices {
            display: flex;
            justify-content: space-between;
            margin-left: 10px;
            align-self: stretch;

            > div {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;

                > div {
                    ${priceItemStyle}
                }
            }
        }
        ` : ''}
        

        > div {
            white-space: nowrap;
            margin: 0 10px;

            ${priceItemStyle}
        }
    }
`;

const Summary = ({
    date,
    openPrice,
    closePrice,
    highPrice,
    lowPrice,
    currencySign,
}) => isMobile ? (
    <Container>
        <div className="date">
            <div>{moment(date).format('MMM, DD')}</div>
            <div>{moment(date).format('YYYY')}</div>
        </div>
        <div className="prices">
            <div>
                <div>{currencySign}{openPrice.toFixed(2)}/{currencySign}{closePrice.toFixed(2)}</div>
                <div>open/close</div>
            </div>
            <div>
                <div>{currencySign}{highPrice.toFixed(2)}/{currencySign}{lowPrice.toFixed(2)}</div>
                <div>hight/low</div>
            </div>
        </div>
    </Container>
) : (
    <Container>
        <div>
            <div>{moment(date).format('MMM, DD')}</div>
            <div>{moment(date).format('YYYY')}</div>
        </div>
        <div>
            <div>{currencySign}{openPrice.toFixed(2)}/{currencySign}{closePrice.toFixed(2)}</div>
            <div>open/close</div>
        </div>
        <div>
            <div>{currencySign}{highPrice.toFixed(2)}/{currencySign}{lowPrice.toFixed(2)}</div>
            <div>hight/low</div>
        </div>
    </Container>
);

Summary.defaultProps = {
    date: new Date(),
    openPrice: 44.37,
    closePrice: 44.47,
    highPrice: 44.69,
    lowPrice: 44.08,
    currencySign: '$',
};


const mapStateToProps = (state) => {
    const {
        Open,
        High,
        Low,
        Close,
    } = getLastPriceHistory(state);
    return {
        date: getLastDate(state),
        openPrice: Open,
        closePrice: Close,
        highPrice: High,
        lowPrice: Low,
    };
};

export default connect(mapStateToProps, {})(Summary);