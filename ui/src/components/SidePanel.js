import React from 'react';
import styled from 'styled-components';

import { colors } from '../constants/style';

import Summary from './Summary';
import NewsItem from './NewsItem';

const Container = styled.aside`
    max-width: 500px;
    width: 25%;
    height: calc(100% - 1px);
    background-color: ${colors.white};
    position: relative;
    margin-top: 1px;
    display: flex;
    flex-direction: column;

    .news_list {
        position: relative;
        margin-top: 140px;
        flex: 1;
        overflow-y: hidden;
        display: flex;
        flex-direction: column;

        div.heading {
            &::before {
                margin: 10px;
            }

            h2 {
                padding: 0px 10px;
            }

            > div {
                padding: 0 10px;
            }
        }

        .news {
            flex: 1;
            overflow-y: auto;
        }
    }
`;

const SidePanel = ({
    selectedTitle,
    newsList,
}) => (
    <Container>
        <Summary />
        <div className="news_list" >
            <div className="heading">
                <h2>Recent news</h2>
                <div>for {selectedTitle}</div>
            </div>
            <div className="news">
                {newsList.map(item => <NewsItem
                    key={`news_${item.id}`}
                    {...item}
                />)}
            </div>
        </div>
    </Container>
);

SidePanel.defaultProps = {
    selectedTitle: 'Your Portfolio',
    newsList: [
        { id: '1' },
        { id: '2' },
        { id: '3' },
        { id: '4' },
        { id: '5' },
        { id: '6' },
        { id: '7' },
        { id: '8' }
    ],
}

export default SidePanel;