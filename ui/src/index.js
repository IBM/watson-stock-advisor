import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import stock from './reducers';
import App from './App';

import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-table/react-table.css'

const store = createStore(stock);

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
