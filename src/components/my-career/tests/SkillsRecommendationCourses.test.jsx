import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';
import {
  defaultSubsidyHooksData,
  mockSubsidyHooksReturnValues,
  queryClient,
  renderWithRouter
} from '../../../utils/tests';
import SkillsRecommendationCourses from '../SkillsRecommendationCourses';
import { TEST_IMAGE_URL } from '../../search/tests/constants';
import {
  useCouponCodes,
  useEnterpriseCustomer,
  useEnterpriseOffers,
  useRedeemablePolicies,
  useSubscriptions,
} from '../../app/data';
import { useCatalogsForSubsidyRequests } from '../../hooks';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useSubscriptions: jest.fn(),
  useRedeemablePolicies: jest.fn(),
  useCouponCodes: jest.fn(),
  useEnterpriseOffers: jest.fn(),
}));

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useCatalogsForSubsidyRequests: jest.fn(),
}));

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  getLocale: () => 'en',
  getMessages: () => ({}),
}));

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
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

const defaultAppState = {
  authenticatedUser: { username: 'myspace-tom' },
};

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
  <QueryClientProvider client={queryClient()}>
    <IntlProvider locale="en">
      <AppContext.Provider value={defaultAppState}>
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
      </AppContext.Provider>
    </IntlProvider>
  </QueryClientProvider>
);

const mockEnterpriseCustomer = {
  slug: 'test-enterprise-slug',
  uuid: 'test-enterprise-uuid',
};

useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
mockSubsidyHooksReturnValues(defaultSubsidyHooksData);

describe('<SkillsRecommendationCourses />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
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
