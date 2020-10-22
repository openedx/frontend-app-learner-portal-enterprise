import { combineReducers } from 'redux';

import { reducer as courseEnrollments } from './components/dashboard/main-content/course-enrollments';
import { reducer as emailSettings } from './components/dashboard/main-content/course-enrollments/course-cards/email-settings';

const rootReducer = combineReducers({
  emailSettings,
  courseEnrollments,
});

export default rootReducer;
