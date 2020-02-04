import { combineReducers } from 'redux';

import { reducer as courseEnrollments } from '@edx/frontend-learner-portal-base/src/components/course-enrollments';
import { reducer as emailSettings } from '@edx/frontend-learner-portal-base/src/components/course-enrollments/course-cards/email-settings';

import { reducer as offers } from './components/dashboard/sidebar/offers';

const identityReducer = (state) => {
  const newState = { ...state };
  return newState;
};

const rootReducer = combineReducers({
  // The authentication state is added as initialState when
  // creating the store in store.js.
  authentication: identityReducer,
  emailSettings,
  courseEnrollments,
  offers,
});

export default rootReducer;
