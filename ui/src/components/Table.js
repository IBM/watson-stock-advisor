import React, { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import ReactTable from 'react-table';
import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from 'reactstrap';
import ReactResizeDetector from 'react-resize-detector';

import { colors } from '../constants/style';

const Container = styled.div`
    position: relative;
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
    }

    .table_container {
        flex: 1;
        overflow-y: hidden;
        width: 100%;
    }

    .ReactTable {
        padding: 20px;
        background-color: ${colors.white};
        border: 0;
        color: ${colors.textGrey};
        font-size: 14px;

        .rt-th {
            border-right: 0 !important;

            > div {
                text-align: left;
                font-weight: 600;
                text-transform: uppercase;
            }
        }

        .rt-tr-group {
            border-bottom: 0 !important;

            &:nth-child(2n) {
                background-color: ${colors.lightGrey};
            }

            &:nth-child(2n+1) {
                background-color: ${colors.white};
            }

            .rt-tr {
                &.selected {
                    border: 2px solid ${colors.textYellow};
                }
            }

            .rt-td {
                border-right: 0;
                display: flex;
                align-items: center;
            }
        }

        .sentiment_label {
            font-size: 12px;
            display: flex;
            margin-bottom: 5px;
            padding: 3px 5px;
            color: ${colors.white};
            border-radius: 3px;
            width: fit-content;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 10px;

            &.positive {
                background-color: ${colors.green};
            }

            &.negative {
                background-color: ${colors.red};
            }

            &.neutral {
                background-color: ${colors.textGrey};
            }
        }
    }
`;

const TrashCell = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${colors.textYellow};

    &:hover {
        background-color: ${colors.textYellow};
        color: ${colors.white};
    }
`;

const Table = ({
    list,
    selectedItemId,
    onSelectItem,
    onDeleteItem,
}) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const closeDialog = () => {
        setIsDialogOpen(false);
    };

    const deleteItem = () => {
        closeDialog();
        onDeleteItem(selectedItemId);
    };

    const selectedItem = list.find(({ id }) => id === selectedItemId);

    return (<Container>
        <div className="heading">
            <h2>Your portfolio</h2>
        </div>
        <div className="table_container">
            <ReactResizeDetector handleHeight>
                {({height}) => (
                    <ReactTable
                        showPagination={false}
                        resizable={false}
                        data={list}
                        defaultPageSize={list.length}
                        getTrProps={(state, { original }) => ({
                            className: original.id === selectedItemId ? 'selected' : '',
                        })}
                        style={{
                            height: `${height}px`,
                        }}
                        columns={[
                            {
                                accessor: 'id',
                                Cell: props => <TrashCell><FontAwesomeIcon
                                    icon={faTrashAlt}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectItem(props.value);
                                        setIsDialogOpen(true);
                                    }}
                                /></TrashCell>,
                                width: 30,
                            },
                            {
                                Header: 'Company',
                                accessor: 'title',
                                Cell: props => <span>{props.value}</span>
                            },
                            {
                                Header: 'Sentiment',
                                accessor: 'sentiment',
                                Cell: ({
                                    value,
                                    origin,
                                }) => <span className={`sentiment_label ${value}`}>
                                        {value}
                                    </span>,
                                width: 105,
                            },
                        ]}
                    />
                )}
            </ReactResizeDetector>
        </div>
        <Modal
            isOpen={isDialogOpen}
            toggle={closeDialog}
            className="confirm_delete"
        >
            <ModalHeader toggle={closeDialog}>Confirm delete</ModalHeader>
            <ModalBody>
                Delete {selectedItem ? selectedItem.title : ''} from your portfolio?
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={deleteItem}>Delete</Button>{' '}
                <Button color="secondary" onClick={closeDialog}>Cancel</Button>
            </ModalFooter>
        </Modal>
    </Container>);
};

Table.defaultProps = {
    list: [
        {
            id: '1',
            title: 'Share 1',
            sentiment: 'positive',
        },
        {
            id: '2',
            title: 'Share 2',
            sentiment: 'negative',
        },
        {
            id: '3',
            title: 'Share 3',
            sentiment: 'neutral',
        },
        {
            id: '4',
            title: 'Share 4',
            sentiment: 'positive',
        },
        {
            id: '5',
            title: 'Share 5',
            sentiment: 'positive',
        },
        {
            id: '6',
            title: 'Share 6',
            sentiment: 'positive',
        },
    ],
    selectedItemId: '2',
    onSelectItem: () => {},
    onDeleteItem: () => {},
};

export default Table;