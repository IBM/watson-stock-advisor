import React from 'react';
import styled from 'styled-components';

import Dropdown from './Dropdown';
import Table from './Table';
import SentimentPie from './SentimentPie';
import Trend from './Trend';

const Container = styled.section`
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 40px;
    aling-items: stretch;

    .top {
        display: flex;

        h1 {
            margin-top: -5px;
            margin-right: 20px;
            font-weight: 600;
        }
    }

    .main {
        display: flex;
        flex-direction: column;
        overflow-y: auto;

        .portfolio {
            min-height: 300px;
            flex: 1;
            display: flex;
            margin-top: 40px;

            > div {
                flex: 1;

                &.table {
                    margin-bottom: 0;
                }

                &.pie {
                }
            }
        }

        .chart {
            min-height: 300px;
            flex: 1;
            display: flex;
            margin-top: 60px;
        }
    }
`;

const Dashboard = () => (
    <Container>
        <div className="top">
            <h1>Overview</h1>
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