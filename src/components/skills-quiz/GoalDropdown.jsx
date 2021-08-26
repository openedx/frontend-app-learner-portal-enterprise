import React, { useContext } from 'react';
import { Form } from '@edx/paragon';
import {
  DROPDOWN_OPTION_CHANGE_CAREERS, DROPDOWN_OPTION_CHANGE_ROLE, DROPDOWN_OPTION_GET_PROMOTED, DROPDOWN_OPTION_OTHER,
} from './constants';
import { SET_KEY_VALUE } from './data/constants';
import { SkillsContext } from './SkillsContextProvider';

const GoalDropdown = () => {
  const { dispatch, state } = useContext(SkillsContext);
  const { goal } = state;

  return (
    <Form.Control
      as="select"
      value={goal}
      onChange={(e) => dispatch({ type: SET_KEY_VALUE, key: 'goal', value: e.target.value })}
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

export default GoalDropdown;
