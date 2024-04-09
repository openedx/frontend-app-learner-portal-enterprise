import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderWithRouter } from '../../../utils/tests';

import CourseSkills, { MAX_VISIBLE_SKILLS } from '../CourseSkills';
import { generateRandomSkills, generateRandomString } from './testUtils';

import { SKILL_DESCRIPTION_CUTOFF_LIMIT, ELLIPSIS_STR } from '../data/constants';
import { shortenString } from '../data/utils';
import { useCourseMetadata, useEnterpriseCustomer } from '../../app/data';
import { enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useCourseMetadata: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockCourseMetadata = {
  skills: generateRandomSkills(MAX_VISIBLE_SKILLS),
};

const CourseSkillsWrapper = () => (
  <IntlProvider locale="en">
    <CourseSkills />
  </IntlProvider>
);

describe('<CourseSkills />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useCourseMetadata.mockReturnValue({ data: mockCourseMetadata });
  });

  test('renders course skills less than or equal to limit', () => {
    renderWithRouter(<CourseSkillsWrapper />);
    mockCourseMetadata.skills.forEach((skill) => {
      expect(screen.queryByText(skill.name)).toBeVisible();
    });
  });

  test('does not render more then max visible skills', () => {
    const skillsCount = MAX_VISIBLE_SKILLS + 2; // random number greater than limit
    const newCourseMetadata = {
      ...mockCourseMetadata,
      skills: generateRandomSkills(skillsCount),
    };
    useCourseMetadata.mockReturnValue({ data: newCourseMetadata });
    renderWithRouter(<CourseSkillsWrapper />);

    const shownSkills = newCourseMetadata.skills.slice(0, MAX_VISIBLE_SKILLS);
    const hiddenSkills = newCourseMetadata.skills.slice(MAX_VISIBLE_SKILLS, skillsCount);

    shownSkills.forEach((skill) => {
      expect(screen.queryByText(skill.name)).toBeVisible();
    });

    // do not display skills greater than limit
    hiddenSkills.forEach((skill) => {
      expect(screen.queryByText(skill.name)).not.toBeVisible();
    });
  });

  test('renders tooltip with course skill description on hover', async () => {
    renderWithRouter(<CourseSkillsWrapper />);
    mockCourseMetadata.skills.forEach(async (skill) => {
      userEvent.hover(screen.getByText(skill.name));
      await waitFor(() => {
        expect(screen.getByText(skill.description)).toBeVisible();
      });
    });
  });

  test('renders tooltip text only till maximum cutoff value when skill description is too long', async () => {
    // set a skill description greater than description cutoff limit
    const newCourseMetadata = {
      ...mockCourseMetadata,
      skills: [
        {
          name: 'Skill with long description',
          description: generateRandomString(SKILL_DESCRIPTION_CUTOFF_LIMIT + 100),
        },
      ],
    };
    useCourseMetadata.mockReturnValue({ data: newCourseMetadata });
    renderWithRouter(<CourseSkillsWrapper />);
    const { skills } = newCourseMetadata;
    const maxVisibleDesc = shortenString(skills[0].description, SKILL_DESCRIPTION_CUTOFF_LIMIT, ELLIPSIS_STR);
    userEvent.hover(screen.getByText(skills[0].name));
    await waitFor(() => {
      expect(screen.getByText(maxVisibleDesc)).toBeVisible();
    });
  });
});
