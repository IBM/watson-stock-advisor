import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import Truncate from 'react-truncate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCaretUp,
    faCaretDown,
} from '@fortawesome/free-solid-svg-icons';

import { colors } from '../constants/style';

const Container = styled.div`
    margin: 0px 10px;
    height: 100px;
    position: relative;
    color: ${colors.textGrey};

    &:nth-child(2n) {
        background-color: ${colors.lightGrey};
    }

    &:nth-child(2n+1) {
        background-color: ${colors.white};
    }
    
    display: flex;

    img {
        width: 80px;
        height: 80px;
        object-fit: cover;
        margin: 10px;
    }

    .body {
        flex: 1;
        padding: 10px 0;

        .date {
            font-size: 12px;
            display: flex;
            margin-bottom: 5px;
            padding: 3px;
            color: ${colors.white};
            border-radius: 3px;
            width: fit-content;
            padding: 0px 5px;

            &.sentiment {
                &.positive {
                    background-color: ${colors.green};
                }

                &.negative {
                    background-color: ${colors.redTriad};
                }
            }

            svg {
                margin-left: 5px;
            }
        }

        .title {
            font-size: 12px;
            text-transform: uppercase;
            font-weight: 600;
        }
    }

    .tags {
        width: 80px;
        font-size: 10px;
        padding: 10px;

        > div {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
    }

    .additional {
        position: absolute;
        right: 0;
        bottom: 0;
        font-size: 10px;

        > div {
            text-align: right;
            white-space: nowrap;
            color: ${colors.textYellow}
        }
    }
`;

const NewsItem = ({
    image,
    url,
    title,
    params,
    date,
    tags,
}) => (
    <Container>
        {image && <img
            src={image}
            alt={title}
        />}
        <div className="body">
            <div className={`date sentiment ${params.sentiment}`}>
                {moment(date).format('DD MMM YYYY')}
                <FontAwesomeIcon
                    icon={params.sentiment === 'positive' ? faCaretUp : faCaretDown}
                />
            </div>
            <div className="title" title={title}>
                <a
                    href={url}
                >
                    <Truncate
                        lines={2}
                        ellipsis="..."
                    >
                        {title}
                    </Truncate>
                </a>
            </div>
        </div>
        <div className="tags">
            {tags.map(tag => <div
                key={`tag_${tag.replace(' ', '')}`}
                title={tag}
            >{tag}</div>)}
        </div>
        <div className="additional">
            <div title={params.company}>Company: {params.company}</div>
            <div title={params.source}>
                Source: {params.source}
            </div>
        </div>
    </Container>
);

export default NewsItem;