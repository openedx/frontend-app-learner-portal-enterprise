import { DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE } from '../skills-quiz/constants';

// eslint-disable-next-line import/prefer-default-export
export function checkValidGoalAndJobSelected(goal, jobs, checkGoaIsImprove) {
  return (checkGoaIsImprove
    ? goal === DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE
    : goal !== DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE)
    && (jobs?.length > 0);
}
