import React, { useContext } from "react";
import { Form } from "@edx/paragon";
import {
  DROPDOWN_OPTION_CHANGE_CAREERS,
  DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE,
  DROPDOWN_OPTION_GET_PROMOTED,
  DROPDOWN_OPTION_OTHER,
  GOAL_DROPDOWN_DEFAULT_OPTION,
} from "../skills-quiz/constants";
import { SET_KEY_VALUE } from "../skills-quiz/data/constants";
import { SkillsContext } from "../skills-quiz/SkillsContextProvider";

const GoalDropdown = () => {
  const { dispatch, state } = useContext(SkillsContext);
  const { goal } = state;
  const selectGoal = (selectedGoal) => {
    dispatch({ type: SET_KEY_VALUE, key: "goal", value: selectedGoal });
  };
  const gaolDropdownOptions = [
    GOAL_DROPDOWN_DEFAULT_OPTION,
    DROPDOWN_OPTION_CHANGE_CAREERS,
    DROPDOWN_OPTION_GET_PROMOTED,
    DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE,
    DROPDOWN_OPTION_OTHER,
  ];

  return (
    <Form.Autosuggest
      className="form-auto-suggest"
      floatingLabel="Select a goal"
      aria-label="AS-Goal"
      errorMessageText="Error, no selected value"
      value={goal}
      onSelected={(value) => selectGoal(value)}
    >
      {gaolDropdownOptions.map((goal) => (
        <Form.AutosuggestOption>{goal}</Form.AutosuggestOption>
      ))}
    </Form.Autosuggest>
  );
};

export default GoalDropdown;
