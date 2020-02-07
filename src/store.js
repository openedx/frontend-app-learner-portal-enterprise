import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction';
import { createLogger } from 'redux-logger';
import { routerMiddleware } from 'react-router-redux';
import { createBrowserHistory } from 'history';

import rootReducer from './rootReducer';

const loggerMiddleware = createLogger();
const history = createBrowserHistory();
const routerHistoryMiddleware = routerMiddleware(history);

const middleware = [thunkMiddleware, loggerMiddleware, routerHistoryMiddleware];

const initialState = {};

const store = createStore(
  rootReducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware)),
);

export default store;
