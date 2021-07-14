import React, { useState } from 'react';
import { Form } from '@edx/paragon';
import PropTypes from 'prop-types';
import {
  DROPDOWN_OPTION_CHANGE_CAREERS, DROPDOWN_OPTION_CHANGE_ROLE, DROPDOWN_OPTION_GET_PROMOTED, DROPDOWN_OPTION_OTHER,
} from './constants';

const GoalDropdown = ({ handleGoalOptionChange }) => {
  const [currentGoal, setCurrentGoal] = useState('Goal');
  const handleDropdownChange = e => {
    setCurrentGoal(e.target.value);
    handleGoalOptionChange(e.target.value);
  };
  return (
    <Form.Control
      as="select"
      value={currentGoal}
      onChange={handleDropdownChange}
      floatingLabel="Goal"
    >
      <option value="">Select a goal</option>
      <option>{DROPDOWN_OPTION_CHANGE_CAREERS}</option>
      <option>{DROPDOWN_OPTION_GET_PROMOTED}</option>
      <option>{DROPDOWN_OPTION_CHANGE_ROLE}</option>
      <option>{DROPDOWN_OPTION_OTHER}</option>
    </Form.Control>
  );
};

GoalDropdown.propTypes = {
  handleGoalOptionChange: PropTypes.func.isRequired,
};

export default GoalDropdown;
