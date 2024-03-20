import React from 'react';
import PropTypes from 'prop-types';
import { Factory } from 'rosie';
import { camelCaseObject } from '@edx/frontend-platform';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderWithRouter } from '../../../utils/tests';

import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';
import { CourseContextProvider } from '../CourseContextProvider';
import CourseSkills, { MAX_VISIBLE_SKILLS } from '../CourseSkills';
import { generateRandomSkills, generateRandomString } from './testUtils';

import { SKILL_DESCRIPTION_CUTOFF_LIMIT, ELLIPSIS_STR } from '../data/constants';
import { shortenString } from '../data/utils';
import { useEnterpriseCustomer } from '../../app/data';

const baseCourseState = {
  activeCourseRun: {},
  userEnrollments: [],
  userEntitlements: [],
  courseRecommendations: {},
  catalog: { catalogList: [] },
};

const baseSubsidyRequestContextValue = {
  catalogsForSubsidyRequests: [],
};

const CourseSkillsWithContext = ({
  courseState,
  initialSubsidyRequestContextValue,
}) => (
  <IntlProvider locale="en">
    <SubsidyRequestsContext.Provider value={initialSubsidyRequestContextValue}>
      <CourseContextProvider courseState={courseState}>
        <CourseSkills />
      </CourseContextProvider>
    </SubsidyRequestsContext.Provider>
  </IntlProvider>
);

CourseSkillsWithContext.propTypes = {
  courseState: PropTypes.shape(),
  initialSubsidyRequestContextValue: PropTypes.shape(),
};

CourseSkillsWithContext.defaultProps = {
  courseState: {},
  initialSubsidyRequestContextValue: baseSubsidyRequestContextValue,
};

const mockEnterpriseCustomer = camelCaseObject(Factory.build('enterpriseCustomer'));

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(() => mockEnterpriseCustomer),
}));

const initialAppState = {
  enterpriseConfig: {
    slug: 'test-enterprise-slug',
  },
};
const courseState = {
  ...baseCourseState,
  course: {
    skills: generateRandomSkills(MAX_VISIBLE_SKILLS),
  },
};

describe('<CourseSkills />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });

  test('renders course skills less than or equal to limit', () => {
    renderWithRouter(
      <CourseSkillsWithContext
        initialAppState={initialAppState}
        courseState={courseState}
      />,
    );
    courseState.course.skills.forEach((skill) => {
      expect(screen.queryByText(skill.name)).toBeVisible();
    });
  });

  test('does not render more then max visible skills', () => {
    const skillsCount = MAX_VISIBLE_SKILLS + 2; // random number greater than limit
    const newCourseState = {
      ...courseState,
      course: {
        ...courseState.course,
        skills: generateRandomSkills(skillsCount),
      },
    };
    renderWithRouter(
      <CourseSkillsWithContext
        initialAppState={initialAppState}
        courseState={newCourseState}
      />,
    );

    const shownSkills = courseState.course.skills.slice(0, MAX_VISIBLE_SKILLS);
    const hiddenSkills = courseState.course.skills.slice(MAX_VISIBLE_SKILLS, skillsCount);

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
        courseState={courseState}
      />,
    );
    /* eslint-disable no-await-in-loop */
    for (const skill of courseState.course.skills) { // eslint-disable-line no-restricted-syntax
      userEvent.hover(screen.getByText(skill.name));
      expect(await screen.findByText(skill.description)).toBeVisible();
    }
    /* eslint-disable no-await-in-loop */
  });

  test('renders tooltip text only till maximum cutoff value when skill description is too long', async () => {
    // set a skill description greater than description cutoff limit
    const newCourseState = {
      ...courseState,
      course: {
        ...courseState.course,
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
        courseState={newCourseState}
      />,
    );
    const { skills } = newCourseState.course;
    const maxVisibleDesc = shortenString(skills[0].description, SKILL_DESCRIPTION_CUTOFF_LIMIT, ELLIPSIS_STR);
    userEvent.hover(screen.getByText(skills[0].name));
    expect(await screen.findByText(maxVisibleDesc)).toBeVisible();
  });
});
