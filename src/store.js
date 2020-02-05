import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction';
import { createLogger } from 'redux-logger';
import { routerMiddleware } from 'react-router-redux';

// import apiClient from '@edx/frontend-learner-portal-base/src/apiClient';
import history from '@edx/frontend-learner-portal-base/src/history';

import rootReducer from './rootReducer';

const loggerMiddleware = createLogger();
const routerHistoryMiddleware = routerMiddleware(history);

const middleware = [thunkMiddleware, loggerMiddleware, routerHistoryMiddleware];

let initialState = {};

// if (typeof window !== 'undefined') {
//   initialState = apiClient.getAuthenticationState();
// }

const store = createStore(
  rootReducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware)),
);

export default store;
