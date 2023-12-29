import React, { useContext } from 'react';
import { Dropdown } from '@openedx/paragon';
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
  const gaolDropdownOptions = [GOAL_DROPDOWN_DEFAULT_OPTION, DROPDOWN_OPTION_CHANGE_CAREERS,
    DROPDOWN_OPTION_GET_PROMOTED, DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE, DROPDOWN_OPTION_OTHER];

  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="outline-primary"
        id="skills-quiz-goal-dropdown-toggle"
      >
        {goal}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {gaolDropdownOptions?.map(option => (
          <Dropdown.Item key={option} as="label" onClick={() => selectGoal(option)}>
            {option}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default GoalDropdown;
