import React from 'react';
import { Dropdown } from '@edx/paragon';
import PropTypes from 'prop-types';
import {
  DROPDOWN_OPTION_CHANGE_CAREERS, DROPDOWN_OPTION_CHANGE_RULE, DROPDOWN_OPTION_GET_PROMOTED, DROPDOWN_OPTION_OTHER,
} from './constants';

const GoalDropdown = ({ currentGoal, setCurrentGoal }) => {
  const handleDropdownChange = selectedGoal => {
    setCurrentGoal(selectedGoal);
  };
  return (
    <Dropdown>
      <Dropdown.Toggle variant="success" id="skill-quiz-goal-dropdown">
        {currentGoal}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => handleDropdownChange(DROPDOWN_OPTION_CHANGE_CAREERS)}>
          {DROPDOWN_OPTION_CHANGE_CAREERS}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleDropdownChange(DROPDOWN_OPTION_GET_PROMOTED)}>
          {DROPDOWN_OPTION_GET_PROMOTED}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleDropdownChange(DROPDOWN_OPTION_CHANGE_RULE)}>
          {DROPDOWN_OPTION_CHANGE_RULE}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleDropdownChange(DROPDOWN_OPTION_OTHER)}>
          {DROPDOWN_OPTION_OTHER}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

GoalDropdown.propTypes = {
  currentGoal: PropTypes.string.isRequired,
  setCurrentGoal: PropTypes.func.isRequired,
};

export default GoalDropdown;
