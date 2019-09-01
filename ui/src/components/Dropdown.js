import React, { useState } from 'react';
import styled from 'styled-components';
import {
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Input,
    Button,
} from 'reactstrap';

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
    }
`;

const Dropdown = ({
    list,
    onSelectItem,
    onAdd,
}) => {
    const [filter, setFilter] = useState('');
    const [selectedItemId, setSelectedItemId] = useState(list[0].id);

    const selectedItem = list.find(({ id }) => id === selectedItemId);
    return (<Container>
        <StyledDropdown>
            <DropdownToggle caret>
                {selectedItem.title}
            </DropdownToggle>
            <DropdownMenu>
                <Input
                    placeholder="filter companies"
                    onChange={e => setFilter(e.target.value)}
                />
                {list.filter(({ title }) => title.toLowerCase().includes(filter)).map(item => (
                    <DropdownItem
                        key={`dropdownitem_${item.id}`}
                        onClick={() => {
                            setSelectedItemId(item.id);
                            onSelectItem(item.id);
                        }}
                    >{item.title}</DropdownItem>
                ))}
            </DropdownMenu>
        </StyledDropdown>
        <Button color="info">Add</Button>
    </Container>);
}

Dropdown.defaultProps = {
    list: [
        {
            title: 'Share 1',
            id: '1',
        },
        {
            title: 'Share 2',
            id: '2',
        },
        {
            title: 'Share 3',
            id: '3',
        },
    ],
    onSelectItem: () => {},
    onAdd: () => { },
}

export default Dropdown;