import React from 'react';
import styled from 'styled-components';
import {} from 'recharts';
import ReactResizeDetector from 'react-resize-detector';
import moment from 'moment';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';
import { connect } from 'react-redux';

import { colors } from '../constants/style';
import {
    getSelectedCompanyName,
    getTrends,
} from '../selectors/portfolio';

const Container = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;

    .heading {
        :before {
            margin: 10px 0px;
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
        padding: 20px;
    }

    .date {
        position: absolute;
        color: ${colors.textGrey};
        font-size: 12px;
        right: 10px;
        bottom: 5px;
    }
`;

const CustomizedDot = (props) => {
    const {
        cx, cy, payload,
    } = props;

    const {
        sentiment,
        value
    } = payload;

    const radius = 2 + 4 * Math.abs(value);
    const size = 2 * radius;

    if (payload.sentiment === 'negative') {
        return (
            <svg
                x={cx - radius}
                y={cy - radius}
                width={size}
                height={size}
                fill={colors.red}
                viewBox="0 0 1024 1024"
            >
                <path d="M517.12 53.248q95.232 0 179.2 36.352t145.92 98.304 98.304 145.92 36.352 179.2-36.352 179.2-98.304 145.92-145.92 98.304-179.2 36.352-179.2-36.352-145.92-98.304-98.304-145.92-36.352-179.2 36.352-179.2 98.304-145.92 145.92-98.304 179.2-36.352zM663.552 261.12q-15.36 0-28.16 6.656t-23.04 18.432-15.872 27.648-5.632 33.28q0 35.84 21.504 61.44t51.2 25.6 51.2-25.6 21.504-61.44q0-17.408-5.632-33.28t-15.872-27.648-23.04-18.432-28.16-6.656zM373.76 261.12q-29.696 0-50.688 25.088t-20.992 60.928 20.992 61.44 50.688 25.6 50.176-25.6 20.48-61.44-20.48-60.928-50.176-25.088zM520.192 602.112q-51.2 0-97.28 9.728t-82.944 27.648-62.464 41.472-35.84 51.2q-1.024 1.024-1.024 2.048-1.024 3.072-1.024 8.704t2.56 11.776 7.168 11.264 12.8 6.144q25.6-27.648 62.464-50.176 31.744-19.456 79.36-35.328t114.176-15.872q67.584 0 116.736 15.872t81.92 35.328q37.888 22.528 63.488 50.176 17.408-5.12 19.968-18.944t0.512-18.944-3.072-7.168-1.024-3.072q-26.624-55.296-100.352-88.576t-176.128-33.28z" />
            </svg>
        );
    }

    if (payload.sentiment === 'positive') {
        return (
            <svg
                x={cx - radius}
                y={cy - radius}
                width={size}
                height={size}
                fill={colors.green}
                viewBox="0 0 1024 1024"
            >
                <path d="M512 1009.984c-274.912 0-497.76-222.848-497.76-497.76s222.848-497.76 497.76-497.76c274.912 0 497.76 222.848 497.76 497.76s-222.848 497.76-497.76 497.76zM340.768 295.936c-39.488 0-71.52 32.8-71.52 73.248s32.032 73.248 71.52 73.248c39.488 0 71.52-32.8 71.52-73.248s-32.032-73.248-71.52-73.248zM686.176 296.704c-39.488 0-71.52 32.8-71.52 73.248s32.032 73.248 71.52 73.248c39.488 0 71.52-32.8 71.52-73.248s-32.032-73.248-71.52-73.248zM772.928 555.392c-18.752-8.864-40.928-0.576-49.632 18.528-40.224 88.576-120.256 143.552-208.832 143.552-85.952 0-164.864-52.64-205.952-137.376-9.184-18.912-31.648-26.592-50.08-17.28-18.464 9.408-21.216 21.472-15.936 32.64 52.8 111.424 155.232 186.784 269.76 186.784 117.984 0 217.12-70.944 269.76-186.784 8.672-19.136 9.568-31.2-9.12-40.096z" />
            </svg>
        );
    }

    return null;
};

const CustomizedAxisTick = ({ x, y, stroke, payload, }) => 
    <g transform={`translate(${x},${y})`}>
        <text
            x={0}
            y={0}
            dy={16}
            textAnchor="end"
            fill="#666"
            transform="rotate(-35)"
            fontSize="10"
        >{payload.value}</text>
    </g>;

const Trend = ({
    selectedItemName,
    data,
    updatedDate,
}) => (<Container>
    <div className="heading">
        <h2>Trend Over Time</h2>
        <div>for {selectedItemName}</div>
    </div>
    <div className="chart_container">
        <ReactResizeDetector handleWidth handleHeight>
            {({ width, height }) => {
                if (!width || !height) {
                    return <div></div>;
                }
                return <LineChart
                    width={width}
                    height={height}
                    data={data}
                    margin={{
                        top: 10,
                        right: 10,
                        left: 10,
                        bottom: 10,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        tick={<CustomizedAxisTick />}
                        height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey="price"
                        stroke={ colors.textYellow }
                        dot={<CustomizedDot />}
                    />
                </LineChart>;
            }}
        </ReactResizeDetector>
    </div>
    <div className="date">Updated: {moment(updatedDate).format('LLLL')}</div>
</Container>);

Trend.defaultProps = {
    selectedItemName: 'Your portfolio',
    updatedDate: new Date(),
    data: [],
}

const mapStateToProps = (state) => ({
    selectedItemName: getSelectedCompanyName(state),
    data: getTrends(state),
});

export default connect(mapStateToProps, {})(Trend);
