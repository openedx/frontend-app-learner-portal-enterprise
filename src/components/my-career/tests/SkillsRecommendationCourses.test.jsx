import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { camelCaseObject } from '@edx/frontend-platform';
import { Factory } from 'rosie';

import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';
import { renderWithRouter } from '../../../utils/tests';
import SkillsRecommendationCourses from '../SkillsRecommendationCourses';
import { TEST_IMAGE_URL } from '../../search/tests/constants';
import { useEnterpriseCustomer } from '../../app/data';
import { useDefaultSearchFilters } from '../../search';

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  getLocale: () => 'en',
  getMessages: () => ({}),
}));

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

jest.mock('../../search', () => ({
  ...jest.requireActual('../../search'),
  useDefaultSearchFilters: jest.fn(),
}));

// eslint-disable-next-line no-console
console.error = jest.fn();

const TEST_SUB_CATEGORY_NAME = 'Information Technology';
const TEST_SKILLS = ['test-skill-1', 'test-skill-2', 'test-skill-3'];
const TEST_COURSE_KEY = 'test-course-key';
const TEST_TITLE = 'Test Title';
const TEST_CARD_IMG_URL = 'https://fake.image';
const TEST_PARTNER = {
  name: 'Partner Name',
  logoImageUrl: TEST_IMAGE_URL,
};
const ADVERTISED_COURSE_RUN = 'course-v1:test-2020';
const courses = {
  hits: [
    {
      key: TEST_COURSE_KEY,
      title: TEST_TITLE,
      card_image_url: TEST_CARD_IMG_URL,
      partners: [TEST_PARTNER],
      skill_names: ['test-skill-1'],
      advertised_course_run: {
        key: ADVERTISED_COURSE_RUN,
      },
    },
    {
      key: TEST_COURSE_KEY,
      title: TEST_TITLE,
      card_image_url: TEST_CARD_IMG_URL,
      partners: [TEST_PARTNER],
      skill_names: ['test-skill-2'],
      advertised_course_run: {
        key: ADVERTISED_COURSE_RUN,
      },
    },
    {
      key: TEST_COURSE_KEY,
      title: TEST_TITLE,
      card_image_url: TEST_CARD_IMG_URL,
      partners: [TEST_PARTNER],
      skill_names: ['test-skill-3'],
      advertised_course_run: {
        key: ADVERTISED_COURSE_RUN,
      },
    },
  ],
  nbHits: 3,
};

const coursesIndex = {
  indexName: 'test-index-name',
  search: jest.fn().mockImplementation(() => Promise.resolve(courses)),
};

const mockEnterpriseCustomer = camelCaseObject(Factory.build('enterpriseCustomer'));

const defaultSearchContext = {
  refinements: { skill_names: TEST_SKILLS },
  dispatch: () => null,
};

const defaultUserSubsidyState = {
  couponCodes: {
    couponCodes: [],
    loading: false,
    couponCodesCount: 0,
  },
};

const defaultSubsidyRequestState = {
  catalogsForSubsidyRequests: [],
};

const SkillsRecommendationCoursesWithContext = ({
  index = coursesIndex,
  subCategoryName = TEST_SUB_CATEGORY_NAME,
  subCategorySkills = TEST_SKILLS,
}) => (
  <IntlProvider locale="en">
    <SearchContext.Provider value={defaultSearchContext}>
      <UserSubsidyContext.Provider value={defaultUserSubsidyState}>
        <SubsidyRequestsContext.Provider value={defaultSubsidyRequestState}>
          <SkillsRecommendationCourses
            index={index}
            subCategoryName={subCategoryName}
            subCategorySkills={subCategorySkills}
          />
        </SubsidyRequestsContext.Provider>
      </UserSubsidyContext.Provider>
    </SearchContext.Provider>
  </IntlProvider>
);

describe('<SkillsRecommendationCourses />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useDefaultSearchFilters.mockReturnValue({ filters: `enterprise_customer_uuids: ${mockEnterpriseCustomer.uuid}` });
  });

  it('renders the SkillsRecommendationCourses component with recommendations', () => {
    renderWithRouter(<SkillsRecommendationCoursesWithContext />);
    TEST_SKILLS.forEach(async (skill) => {
      await waitFor(() => expect(screen.getByText(skill)).toBeInTheDocument());
    });
    userEvent.click(screen.getByText('Show more courses'));
  });

  it('renders the SkillsRecommendationCourses component without recommendations', () => {
    const emptyIndex = {
      indexName: 'test-index-name',
      search: jest.fn().mockImplementation(() => Promise.resolve({
        hits: [],
        nbHits: 0,
      })),
    };

    renderWithRouter(<SkillsRecommendationCoursesWithContext index={emptyIndex} subCategorySkills={[]} subCategoryName="" />);
    TEST_SKILLS.forEach(async (skill) => {
      await waitFor(() => expect(screen.getByText(skill)).not.toBeInTheDocument());
    });
    expect(screen.queryByText('More courses that teach you ', { exact: true })).not.toBeInTheDocument();
  });
});
