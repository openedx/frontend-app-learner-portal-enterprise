import React from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter } from '../../../utils/tests';

import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';
import { CourseContextProvider } from '../CourseContextProvider';
import CourseSkills, { MAX_VISIBLE_SKILLS } from '../CourseSkills';
import { generateRandomSkills, generateRandomString } from './testUtils';

import { SKILL_DESCRIPTION_CUTOFF_LIMIT, ELLIPSIS_STR } from '../data/constants';
import { shortenString } from '../data/utils';

const baseCourseState = {
  activeCourseRun: {},
  userEnrollments: [],
  userEntitlements: [],
  courseRecommendations: {},
  catalog: { catalogList: [] },
};

const baseSubsidyRequestContextValue = {
  catalogsForSubsidyRequests: new Set(),
};

const CourseSkillsWithContext = ({
  initialAppState,
  initialCourseState,
  initialSubsidyRequestContextValue,
}) => (
  <AppContext.Provider value={initialAppState}>
    <SubsidyRequestsContext.Provider value={initialSubsidyRequestContextValue}>
      <CourseContextProvider initialState={initialCourseState}>
        <CourseSkills />
      </CourseContextProvider>
    </SubsidyRequestsContext.Provider>
  </AppContext.Provider>
);

CourseSkillsWithContext.propTypes = {
  initialAppState: PropTypes.shape(),
  initialCourseState: PropTypes.shape(),
  initialSubsidyRequestContextValue: PropTypes.shape(),
};

CourseSkillsWithContext.defaultProps = {
  initialAppState: {},
  initialCourseState: {},
  initialSubsidyRequestContextValue: baseSubsidyRequestContextValue,
};

describe('<CourseSkills />', () => {
  const initialAppState = {
    enterpriseConfig: {
      slug: 'test-enterprise-slug',
    },
  };
  const initialCourseState = {
    ...baseCourseState,
    course: {
      skills: generateRandomSkills(MAX_VISIBLE_SKILLS),
    },
  };

  test('renders course skills less than or equal to limit', () => {
    renderWithRouter(
      <CourseSkillsWithContext
        initialAppState={initialAppState}
        initialCourseState={initialCourseState}
      />,
    );
    initialCourseState.course.skills.forEach((skill) => {
      expect(screen.queryByText(skill.name)).toBeVisible();
    });
  });

  test('does not render more then max visible skills', () => {
    const skillsCount = MAX_VISIBLE_SKILLS + 2; // random number greater than limit
    const courseState = {
      ...initialCourseState,
      course: {
        ...initialCourseState.course,
        skills: generateRandomSkills(skillsCount),
      },
    };
    renderWithRouter(
      <CourseSkillsWithContext
        initialAppState={initialAppState}
        initialCourseState={courseState}
      />,
    );

    const shownSkills = initialCourseState.course.skills.slice(0, MAX_VISIBLE_SKILLS);
    const hiddenSkills = initialCourseState.course.skills.slice(MAX_VISIBLE_SKILLS, skillsCount);

    shownSkills.forEach((skill) => {
      expect(screen.queryByText(skill.name)).toBeVisible();
    });

    // do not display skills greater than limit
    hiddenSkills.forEach((skill) => {
      expect(screen.queryByText(skill.name)).not.toBeVisible();
    });
  });

  test('renders tooltip with course skill description on hover', async () => {
    renderWithRouter(
      <CourseSkillsWithContext
        initialAppState={initialAppState}
        initialCourseState={initialCourseState}
      />,
    );
    /* eslint-disable no-await-in-loop */

    for (const skill of initialCourseState.course.skills) { // eslint-disable-line no-restricted-syntax
      await act(async () => {
        fireEvent.mouseOver(screen.getByText(skill.name));
      });
      expect(await screen.queryByText(skill.description)).toBeVisible();
    }
    /* eslint-disable no-await-in-loop */
  });

  test('renders tooltip text only till maximum cutoff value when skill description is too long', async () => {
    // set a skill description greater than description cutoff limit
    const courseState = {
      ...initialCourseState,
      course: {
        ...initialCourseState.course,
        skills: [
          {
            name: 'Skill with long description',
            description: generateRandomString(SKILL_DESCRIPTION_CUTOFF_LIMIT + 100),
          },
        ],
      },
    };

    renderWithRouter(
      <CourseSkillsWithContext
        initialAppState={initialAppState}
        initialCourseState={courseState}
      />,
    );
    const { skills } = courseState.course;
    const maxVisibleDesc = shortenString(skills[0].description, SKILL_DESCRIPTION_CUTOFF_LIMIT, ELLIPSIS_STR);
    await act(async () => {
      fireEvent.mouseOver(screen.getByText(skills[0].name));
    });
    expect(await screen.queryByText(maxVisibleDesc)).toBeVisible();
  });
});
