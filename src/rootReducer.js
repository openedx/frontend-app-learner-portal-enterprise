import { combineReducers } from 'redux';
import { userAccount } from '@edx/frontend-auth';

import { reducer as courseEnrollments } from '@edx/frontend-learner-portal-base/src/components/course-enrollments';
import { reducer as emailSettings } from '@edx/frontend-learner-portal-base/src/components/course-enrollments/course-cards/email-settings';

import { reducer as offers } from './components/dashboard/sidebar/offers';

const initialUserAccountState = {
  profileImage: {
    imageUrlMedium: null,
  },
  username: 'stank',
};

const identityReducer = (state = initialUserAccountState, action) => {
  const newState = { ...state };
  return newState;
};

const rootReducer = combineReducers({
  // authentication: identityReducer,
  emailSettings,
  courseEnrollments,
  offers,
  userAccount,
});

export default rootReducer;
