import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { colors } from '../constants/style';

const Container = styled.div`
    height: 60px;
    width: 100%;
    position: relative;
    color: ${colors.textGrey};
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;

    .separator {
        z-index: 10;
        position: absolute;
        top: 0;
        bottom: 0;
        width: 1px;
        right: 0;
        background-color: ${colors.separatorGrey};
        box-shadow: -1px 0px 1px 0px rgba(241,241,241,1);
    }

    &.active {
        color: ${colors.textYellow};

        .separator {
            background-color: ${colors.textYellow};
            width: 2px;
        }
    }
`;

const NavItem = ({
    icon,
    title,
    isActive,
    onClick,
}) => (
    <Container
        title={title}
        onClick={onClick}
        className={isActive ? 'active' : ''}
    >
        <FontAwesomeIcon icon={icon} />
        <div className="separator" />
    </Container>
);

export default NavItem;
