import React from 'react';
import styled from 'styled-components';
import { faListAlt, faUserCircle } from '@fortawesome/free-solid-svg-icons';

import NavItem from './NavItem';
import { colors } from '../constants/style';

const Container = styled.nav`
    width: 100px;
    height: calc(100% - 50px);
    margin: 30px 0;
    position: relative;

    > div {
        height: calc(100% - 60px);

        &.separator {
            position: absolute;
            top: 0px;
            width: 1px;
            right: 0;
            background-color: ${colors.separatorGrey};
            box-shadow: -1px 0px 1px 0px rgba(241,241,241,1);
        }

        &.navigation {
            padding: 50px 0;
            display: flex;
            flex-direction: column;
        }
    }
`;

const Nav = () => (
    <Container>
        <div className="navigation">
            <NavItem
                id="portfolio"
                icon={faListAlt}
                title="Your portfolio"
                isActive={true}
                onClick={(id) => console.log(`clicked ${id}`)}
            />
            <NavItem
                id="profile"
                icon={faUserCircle}
                title="My profile"
                onClick={(id) => console.log(`clicked ${id}`)}
            />
        </div>
        <div className="separator" />
    </Container>
)


export default Nav;