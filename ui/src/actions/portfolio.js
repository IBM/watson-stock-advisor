import { createAction } from 'redux-actions';
import {
    ADD_COMPANY_INTENT,
    ADD_COMPANY_SUCCESS,
    ADD_COMPANY_FAILED,
    PORTFOLIO_LIST_LOAD_SUCCESS,
    SELECT_SHARE,
    DELETE_COMPANY_INTENT,
    DELETE_COMPANY_SUCCESS,
    DELETE_COMPANY_FAILED,
} from '../constants/portfolio';

import {
    addCompany as addCompanyApi,
    deleteCompany as deleteCompanyApi,
    getPortfolio,
} from '../datasources/api';

const addCompanyIntent = createAction(ADD_COMPANY_INTENT, item => item);
const addCompanySuccess = createAction(ADD_COMPANY_SUCCESS, (item, data) => ({
    item,
    data,
}));
const addCompanyFailed = createAction(ADD_COMPANY_FAILED, (item, error) => ({
    item,
    error,
}));

export const addCompany = (item) => async (dispatch, getState) => {
    dispatch(addCompanyIntent(item));
    try {
        const data = await addCompanyApi(item.name);
        if (data.error) {
            alert(data.error.reason);
            dispatch(addCompanyFailed(item, data.error));
        } else {
            dispatch(addCompanySuccess(item, data));
            dispatch(selectShare(data.ticker));
        }
    } catch (e) {
        alert(`Can't add ${item.name} due to service error`);
        dispatch(addCompanyFailed(item, e));
    }
};

const porflolioLoaded = createAction(PORTFOLIO_LIST_LOAD_SUCCESS);

export const initAction = () => async (dispatch, getState) => {
    try {
        const data = await getPortfolio();
        dispatch(porflolioLoaded(data));
    } catch (e) {
        alert(`Can't load you portfolio due to service error`);
    }
};

export const selectShare = createAction(SELECT_SHARE);

const deleteCompanyIntent = createAction(DELETE_COMPANY_INTENT, item => item);
const deleteCompanySuccess = createAction(DELETE_COMPANY_SUCCESS, item => item);
const deleteCompanyFailed = createAction(DELETE_COMPANY_FAILED, item => item);

export const deleteCompany = (item) => async (dispatch, getState) => {
    dispatch(deleteCompanyIntent(item.id));
    try {
        await deleteCompanyApi(item.name);
        dispatch(deleteCompanySuccess(item.id));
    } catch (e) {
        alert(`Can't add ${item.name} due to service error`);
        dispatch(deleteCompanyFailed(item.id));
    }
};