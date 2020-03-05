import { combineReducers } from 'redux';

import { reducer as courseEnrollments } from './components/dashboard/main-content/course-enrollments';
import { reducer as emailSettings } from './components/dashboard/main-content/course-enrollments/course-cards/email-settings';
import { reducer as offers } from './components/dashboard/sidebar/offers';

const rootReducer = combineReducers({
  emailSettings,
  courseEnrollments,
  offers,
});

export default rootReducer;
