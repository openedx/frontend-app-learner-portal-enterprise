import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { CourseContextProvider } from '../CourseContextProvider';
import CourseSkills, { MAX_VISIBLE_SKILLS } from '../CourseSkills';

import { SKILLS_BUTTON_LABEL } from '../data/constants';

/* eslint-disable react/prop-types */
const CourseSkillsWithContext = ({
  initialAppState = {},
  initialCourseState = {},
}) => (
  <AppContext.Provider value={initialAppState}>
    <CourseContextProvider initialState={initialCourseState}>
      <CourseSkills />
    </CourseContextProvider>
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

describe('<CourseSkills />', () => {
  const initialAppState = {
    enterpriseConfig: {
      slug: 'test-enterprise-slug',
    },
  };
  const initialCourseState = {
    course: {
      skillNames: ['test-skill1', 'test-skill2', 'test-skill3', 'test-skill4'],
    },
  };

  test('renders course skills less than limit', () => {
    render(
      <CourseSkillsWithContext
        initialAppState={initialAppState}
        initialCourseState={initialCourseState}
      />,
    );
    initialCourseState.course.skillNames.forEach((skill) => {
      expect(screen.queryByText(skill)).toBeVisible();
    });
  });

  test('renders course skills greater than limit', () => {
    const skillGreaterThanLimit = ['test-skill1', 'test-skill2', 'test-skill3', 'test-skill4', 'test-skill5', 'test-skill6'];
    const courseState = {
      ...initialCourseState,
      course: {
        ...initialCourseState.course,
        skillNames: skillGreaterThanLimit,
      },
    };
    render(
      <CourseSkillsWithContext
        initialAppState={initialAppState}
        initialCourseState={courseState}
      />,
    );

    const shownSkills = initialCourseState.course.skillNames.slice(0, MAX_VISIBLE_SKILLS);
    const hiddenSkills = initialCourseState.course.skillNames.slice(MAX_VISIBLE_SKILLS, skillGreaterThanLimit.length);

    shownSkills.forEach((skill) => {
      expect(screen.queryByText(skill)).toBeVisible();
    });

    // do not display skills greater than limit
    hiddenSkills.forEach((skill) => {
      expect(screen.queryByText(skill)).not.toBeVisible();
    });

    // display show more inline link when skills count is greater than limit
    expect(screen.queryByText(SKILLS_BUTTON_LABEL.SHOW_MORE)).toBeInTheDocument();
  });
});
