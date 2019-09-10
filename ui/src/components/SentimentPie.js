import React, { useState } from 'react';
import styled from 'styled-components';
import {
    PieChart,
    Pie,
    Sector,
} from 'recharts';
import ReactResizeDetector from 'react-resize-detector';
import moment from 'moment';
import { connect } from 'react-redux';
import { isMobile } from 'react-device-detect';

import { colors } from '../constants/style';
import {
    getSelectedCompanyName,
    getPieChart,
} from '../selectors/portfolio';

const colorMap = {
    'positive': colors.green,
    'negative': colors.red,
    'neutral': colors.textGrey,
};

const Container = styled.div`
    position: relative;
    margin-left: ${isMobile ? 0 : 40}px;
    ${isMobile ? 'height: 200px;' : ''}
    display: flex;
    flex-direction: column;
    height: 100%;

    .heading {
        :before {
            margin: 10px 0px;
            top: -10px;
        }

        h2 {
            padding: 10px 0;
        }

        div {
            padding: 0;
            margin-top: -20px;
        }
    }

    .chart_container {
        position: relative;
        background-color: ${colors.white};
        flex: 1;
    }

    .date {
        position: absolute;
        color: ${colors.textGrey};
        font-size: 12px;
        right: 10px;
        bottom: 5px;
    }
`;

const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const {
        cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
        fill, payload, value,
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>{payload.name}</text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 6}
                outerRadius={outerRadius + 10}
                fill={fill}
            />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value}`}</text>
        </g>
    );
};

const SentimentPie = ({
    selectedItemName,
    data,
    updatedDate,
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const onPieEnter = (data, index) => {
        setActiveIndex(index);
    };

    const coloredData = data.map(item => ({
        ...item,
        fill: colorMap[item.name],
    }));

    const renderChart = ({ width, height }) => {
        if (!width || !height) {
            return <div></div>;
        }
        return (<div>
            <PieChart
                width={width}
                height={height}
            >
                <Pie
                    labels={coloredData.map(({ name }) => name)}
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={coloredData}
                    cx={width / 2}
                    cy={height / 2 - 10}
                    innerRadius={Math.min(width, height) / 4 - 10}
                    outerRadius={Math.min(width, height) / 4 + 10}
                    fill="#8884d8"
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                />
            </PieChart>
        </div>)
    };

    return <Container>
        <div className="heading">
            <h2>Sentiment Breakdown</h2>
            <div>for {selectedItemName}</div>
        </div>
        <div className="chart_container">
            <ReactResizeDetector handleWidth handleHeight>
                {({ width, height }) => renderChart({
                    width,
                    height: isMobile ? 200 : height,
                })}
            </ReactResizeDetector>
        </div>
        <div className="date">Updated: {moment(updatedDate).format('LLLL')}</div>
    </Container>
};

SentimentPie.defaultProps = {
    selectedItemName: 'Your Portfolio',
    data: [
        { name: 'Positive', value: 29, fill: colors.green, },
        { name: 'Negative', value: 4, fill: colors.red, },
        { name: 'Neutral', value: 6, fill: colors.textGrey, },
    ],
    updatedDate: new Date(),
};

const mapStateToProps = (state) => ({
    selectedItemName: getSelectedCompanyName(state),
    data: getPieChart(state),
});

export default connect(mapStateToProps, {})(SentimentPie);