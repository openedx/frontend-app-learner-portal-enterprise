import { useContext } from 'react';
import { Dropdown } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import goalMessages from './goalMessages';
import {
  DROPDOWN_OPTION_CHANGE_CAREERS, DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE, DROPDOWN_OPTION_GET_PROMOTED,
  DROPDOWN_OPTION_OTHER, GOAL_DROPDOWN_DEFAULT_OPTION,
} from './constants';
import { SET_KEY_VALUE } from './data/constants';
import { SkillsContext } from './SkillsContextProvider';

const GoalDropdown = () => {
  const { dispatch, state } = useContext(SkillsContext);
  const { goal } = state;
  const selectGoal = (selectedGoal) => {
    dispatch({ type: SET_KEY_VALUE, key: 'goal', value: selectedGoal });
  };
  const goalDropdownOptions = [GOAL_DROPDOWN_DEFAULT_OPTION, DROPDOWN_OPTION_CHANGE_CAREERS,
    DROPDOWN_OPTION_GET_PROMOTED, DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE, DROPDOWN_OPTION_OTHER];

  const optionToMessageKey = {
    [GOAL_DROPDOWN_DEFAULT_OPTION]: 'selectGoal',
    [DROPDOWN_OPTION_CHANGE_CAREERS]: 'changeCareers',
    [DROPDOWN_OPTION_GET_PROMOTED]: 'getPromoted',
    [DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE]: 'improveCurrentRole',
    [DROPDOWN_OPTION_OTHER]: 'other',
  };

  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="outline-primary"
        id="skills-quiz-goal-dropdown-toggle"
        data-testid="skills-quiz-goal-dropdown-toggle"
      >
        <FormattedMessage {...goalMessages[optionToMessageKey[goal]]} />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {goalDropdownOptions?.map(option => (
          <Dropdown.Item key={option} as="label" onClick={() => selectGoal(option)}>
            <FormattedMessage {...goalMessages[optionToMessageKey[option]]} />
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default GoalDropdown;
