import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Container = styled.div`
    width: 100%;
    position: relative,

    .title {
        position: absolute;
        top: -15px;
        left: 10px;
        padding: 5px;
        background-color: #ffffff;
    }
`;

const Panel = ({
    children,
    title,
    icon,
    footer,
}) => (
    <Container>
        <div className="title">
            {icon && <FontAwesomeIcon icon={icon} />}
            {title}
        </div>
        <div>{children}</div>
        <div className="footer">
            {footer}
        </div>
    </Container>
);

export default Panel;