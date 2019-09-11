import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Input,
    Button,
} from 'reactstrap';
import { connect } from 'react-redux';
import { isMobile } from 'react-device-detect';

import { addCompany } from '../actions/portfolio';
import { getCompanyList } from '../datasources/api';

import { colors } from '../constants/style';

const Container = styled.div`
    display: flex;
    flex-direction: ${isMobile ? 'column' : 'row'};

    > button {
        width: 100px;
        align-self: ${isMobile ? 'flex-end' : 'start'}
    }
`;

const StyledDropdown = styled(UncontrolledDropdown)`
    margin-right: 10px;
    
    .dropdown-toggle {
        width: 100%;
        ${isMobile ? `overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;` : ''}
        padding: 6px 0px;
        color: ${colors.textGrey};
        background: transparent;
        border: 0;
        text-transform: uppercase;
        font-weight: 600;
        text-decoration: underline;

        &:hover, &:focus, &:active {
            color: ${colors.textYellow} !important;
            background: transparent !important;
            border: 0 !important;
        }
    }

    .dropdown-menu {
        ${isMobile ? `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            max-height: none !important;
        ` : ''}
        .dropdown-item {
            text-transform: uppercase;
            font-size: 14px;
        }
    }

    &.show {
        .dropdown-toggle {
            color: ${colors.textGrey}  !important;
            background: transparent !important;
            border: 0  !important;
            text-transform: uppercase;
            font-weight: 600;
            text-decoration: underline;

            &:hover, &:focus, &:active {
                color: ${colors.textYellow} !important;
                background: transparent !important;
                border: 0 !important;
            }
        }

        .dropdown-menu {
            display: block;
            max-height: 500px;
            overflow-y: auto;
            transform: none !important;
        }
    }
`;

const Dropdown = ({
    onAdd,
}) => {
    const [filter, setFilter] = useState('');
    const [selectedItemTicker, setSelectedItemTicker] = useState();
    const [list, setList] = useState([]);
    
    useEffect(() => {
        const fetchData = async () => {
            const result = await getCompanyList();
            setList(result);
            setSelectedItemTicker(result[0].ticker);
        };
        fetchData();
    }, []);

    const selectedItem = list.find(({ ticker }) => ticker === selectedItemTicker) || {};

    const addClick = () => {
        onAdd(selectedItem);
    };

    const menu = (<DropdownMenu>
        <Input
            placeholder="filter companies"
            onChange={e => setFilter(e.target.value)}
        />
        {list.filter(({ name }) => name.toLowerCase().includes(filter)).map(item => (
            <DropdownItem
                key={`dropdownitem_${item.ticker}`}
                onClick={() => { setSelectedItemTicker(item.ticker); }}
            >{item.name}</DropdownItem>
        ))}
    </DropdownMenu>);

    return (<Container>
        <StyledDropdown>
            <DropdownToggle caret>
                {selectedItem.name}
            </DropdownToggle>
            {menu}
        </StyledDropdown>
        <Button
            color="info"
            onClick={addClick}
        >Add</Button>
    </Container>);
}

Dropdown.defaultProps = {
    onAdd: () => { },
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
    onAdd: addCompany,
};

export default connect(mapStateToProps, mapDispatchToProps)(Dropdown);