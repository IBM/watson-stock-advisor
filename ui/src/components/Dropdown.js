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

import { addCompany } from '../actions/portfolio';
import { getCompanyList } from '../datasources/api';

import { colors } from '../constants/style';

const Container = styled.div`
    display: flex;
`;

const StyledDropdown = styled(UncontrolledDropdown)`
    margin-right: 10px;
    
    .dropdown-toggle {
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
    onSelectItem,
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

    const selectItem = (ticker) => (e) => {
        e.stopPropagation();
        setSelectedItemTicker(ticker);
        onSelectItem(ticker);
    };

    const addClick = () => {
        onAdd(selectedItem);
    };

    return (<Container>
        <StyledDropdown>
            <DropdownToggle caret>
                {selectedItem.name}
            </DropdownToggle>
            <DropdownMenu>
                <Input
                    placeholder="filter companies"
                    onChange={e => setFilter(e.target.value)}
                />
                {list.filter(({ name }) => name.toLowerCase().includes(filter)).map(item => (
                    <DropdownItem
                        key={`dropdownitem_${item.ticker}`}
                        onClick={selectItem(item.ticker)}
                    >{item.name}</DropdownItem>
                ))}
            </DropdownMenu>
        </StyledDropdown>
        <Button
            color="info"
            onClick={addClick}
        >Add</Button>
    </Container>);
}

Dropdown.defaultProps = {
    onSelectItem: () => {},
    onAdd: () => { },
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
    onAdd: addCompany,
};

export default connect(mapStateToProps, mapDispatchToProps)(Dropdown);