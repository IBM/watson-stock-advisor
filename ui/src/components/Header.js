import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPercentage } from '@fortawesome/free-solid-svg-icons';

import { colors } from '../constants/style';

const Container = styled.header`
    width: 100%;
    height: 50px;
    background-color: ${colors.white};
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Header = () => (
    <Container>
        <FontAwesomeIcon icon={faPercentage} />
        <span className="logo bold" >WATSON </span>
        <span className="logo" >TEST</span>
    </Container>
);

export default Header;