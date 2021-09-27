import { checkValidGoalAndJobSelected } from '../skills-quiz';
import { DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE, GOAL_DROPDOWN_DEFAULT_OPTION } from '../../skills-quiz/constants';

describe('checkValidGoalAndJobSelected', () => {
  it('checks logic by giving various inputs', () => {
    expect(checkValidGoalAndJobSelected(DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE, ['test-job'], true)).toEqual(true);
    expect(checkValidGoalAndJobSelected(DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE, ['test-job'], false)).toEqual(false);
    expect(checkValidGoalAndJobSelected(GOAL_DROPDOWN_DEFAULT_OPTION, ['test-job'], false)).toEqual(true);
    expect(checkValidGoalAndJobSelected(GOAL_DROPDOWN_DEFAULT_OPTION, [], false)).toEqual(false);
    expect(checkValidGoalAndJobSelected(DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE, [], false)).toEqual(false);
    expect(checkValidGoalAndJobSelected(GOAL_DROPDOWN_DEFAULT_OPTION, [], true)).toEqual(false);
    expect(checkValidGoalAndJobSelected(DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE, [], true)).toEqual(false);
  });
});
