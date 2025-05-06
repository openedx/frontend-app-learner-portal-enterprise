import { DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE } from '../skills-quiz/constants';

export function checkValidGoalAndJobSelected(goal, jobs, checkGoalIsImprove) {
  const goalIsValid = checkGoalIsImprove === (goal === DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE);

  return goalIsValid && jobs?.length > 0;
}
