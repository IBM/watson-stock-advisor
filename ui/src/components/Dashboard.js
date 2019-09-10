import React from 'react';
import styled from 'styled-components';
import { isMobile } from 'react-device-detect';

import Dropdown from './Dropdown';
import Table from './Table';
import SentimentPie from './SentimentPie';
import Trend from './Trend';
import Summary from './Summary';

const Container = styled.section`
    flex: 1;
    ${isMobile ? '' : 'height: 100%;'};
    display: flex;
    flex-direction: column;
    padding: ${isMobile ? 10 : 40}px;
    aling-items: stretch;

    .top {
        display: flex;
        flex-direction: ${isMobile ? 'column' : 'row'};

        h1 {
            ${isMobile ? 'margin-top: 0;' : 'margin-top: -5px;'}
            margin-right: 20px;
            font-weight: 600;
            ${isMobile ? 'font-size: 30px;' : ''}
        }
    }

    .main {
        display: flex;
        flex-direction: column;
        overflow-y: auto;

        .portfolio {
            ${isMobile ? '' : 'min-height: 300px;'}
            flex: 1;
            flex-direction: ${isMobile ? 'column' : 'row'};
            display: flex;
            margin-top: ${isMobile ? 10 : 40}px;

            > div {
                flex: 1;

                &.table {
                    margin-bottom: 0;
                }

                &.pie {
                    margin-top: ${isMobile ? '20px' : '0'};
                }
            }
        }

        .chart {
            min-height: 300px;
            flex: 1;
            display: flex;
            margin-top: ${isMobile ? 20 : 60}px;
        }
    }
`;

const Dashboard = () => (
    <Container>
        <div className="top">
            <h1>Overview</h1>
            {isMobile && <Summary />}
            <div className="shares_list">
                <Dropdown />
            </div>
        </div>
        <div className="main">
            <div className="portfolio">
                <div className="table"><Table /></div>
                <div className="pie"><SentimentPie /></div>
            </div>
            <div className="chart"><Trend /></div>
        </div>
    </Container>
);

export default Dashboard;