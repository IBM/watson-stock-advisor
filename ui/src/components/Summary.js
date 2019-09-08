import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { connect } from 'react-redux';

import { colors } from '../constants/style';

import {
    getLastDate,
    getPriceHistory,
    getLastPriceHistory,
} from '../selectors/portfolio';

const Container = styled.summary`
    position: absolute;
    background-color: ${colors.darkGrey};
    top: 20px;
    right: 0;
    width: 130%;
    height: 100px;
    box-shadow: 0px 2px 7px 0px rgba(156,156,156,1);

    display: flex;
    justify-content: space-evenly;
    align-items: center;

    > div {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0 10px;

        > div {
            white-space: nowrap;
            margin: 0 10px;

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
}) => (
    <Container>
        <div>
            <div>{moment(date).format('MMM, DD')}</div>
            <div>{moment(date).format('YYYY')}</div>
        </div>
        <div>
            <div>{currencySign}{openPrice}/{currencySign}{closePrice}</div>
            <div>open/close</div>
        </div>
        <div>
            <div>{currencySign}{highPrice}/{currencySign}{lowPrice}</div>
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