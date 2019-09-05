import axios from 'axios';

import endpoints from '../config/endpoints';

const api = axios;
const { SERVICE_URL } = endpoints;

const getUrl = (url) => `${SERVICE_URL}${url}`;

const get = (requestOptions) => {
    return api({
        method: 'get',
        ...requestOptions,
        url: getUrl(requestOptions.url),
    }).then((result) => {
        return result.data;
    }).catch((error) => {
        throw error;
    });
};

const post = (requestOptions) => {
    return api({
        method: 'post',
        ...requestOptions,
        url: getUrl(requestOptions.url),
    }).then((result) => {
        return result.data;
    }).catch((error) => {
        throw error;
    });
}

export const getPortfolio = () => get({
    url: '/api/stocks',
});

export const getCompanyList = () => get({
    url: '/api/companies',
});

export const addCompany = (company) => post({
    url: '/api/companies/add',
    data: {
        name: company
    }
});

export const deleteCompany = (company) => post({
    url: '/api/companies/delete',
    data: {
        name: company
    }
});