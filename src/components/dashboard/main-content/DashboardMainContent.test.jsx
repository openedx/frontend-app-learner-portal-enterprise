import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import { useEnterpriseCuration } from '../../search/content-highlights/data';
import DashboardMainContent from './DashboardMainContent';
import { CourseEnrollmentsContextProvider } from './course-enrollments';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { SubsidyRequestsContext, SUBSIDY_TYPE } from '../../enterprise-subsidy-requests';
import { renderWithRouter } from '../../../utils/tests';

jest.mock('../../search/content-highlights/data', () => ({
  useEnterpriseCuration: jest.fn(() => ({
    enterpriseCuration: {
      canOnlyViewHighlightSets: jest.fn(),
    },
  })),
}));

const DashboardMainContentWrapper = ({
  initialAppState = { fakeContext: 'foo' },
  initialUserSubsidyState = {},
  initialSubsidyRequestsState = {
    subsidyRequestConfiguration: {},
    requestsBySubsidyType: {
      [SUBSIDY_TYPE.LICENSE]: [],
      [SUBSIDY_TYPE.COUPON]: [],
    },

  },
  initialCourseEnrollmentsState = {
    courseEnrollmentsByStatus: {},
  },
}) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <SubsidyRequestsContext.Provider value={initialSubsidyRequestsState}>
        <CourseEnrollmentsContextProvider value={initialCourseEnrollmentsState}>
          <DashboardMainContent />
        </CourseEnrollmentsContextProvider>
      </SubsidyRequestsContext.Provider>
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);

describe('DashboardMainContent', () => {
  const defaultUserSubsidyState = {
    subscriptionPlan: undefined,
    subscriptionLicense: undefined,
    couponCodes: {
      couponCodes: [],
      loading: false,
      couponCodesCount: 0,
    },
    enterpriseOffers: [],
  };
  const initialAppState = {
    enterpriseConfig: {
      slug: 'slug',
      uuid: 'uuid',
    },
  };
  it('renders recommended courses when canOnlyViewHighlightSets false', () => {
    useEnterpriseCuration.mockImplementation(() => ({
      enterpriseCuration: {
        canOnlyViewHighlightSets: false,
      },
    }));
    renderWithRouter(<DashboardMainContentWrapper
      initialAppState={initialAppState}
      initialUserSubsidyState={defaultUserSubsidyState}
    />);
    expect(screen.getByText('Recommend courses for me')).toBeInTheDocument();
  });
  it('renders recommended courses when canOnlyViewHighlightSets false', () => {
    useEnterpriseCuration.mockImplementation(() => ({
      enterpriseCuration: {
        canOnlyViewHighlightSets: true,
      },
    }));
    renderWithRouter(<DashboardMainContentWrapper
      initialAppState={initialAppState}
      initialUserSubsidyState={defaultUserSubsidyState}
    />);
    expect(screen.queryByText('Recommend courses for me')).not.toBeInTheDocument();
  });
  it('Displays disableSearch Flag message', () => {
    renderWithRouter(<DashboardMainContentWrapper
      initialAppState={{
        ...initialAppState,
        enterpriseConfig: {
          ...initialAppState.enterpriseConfig,
          disableSearch: true,
        },
      }}
      initialUserSubsidyState={defaultUserSubsidyState}
    />);
    expect(screen.getByText('Reach out to your administrator for instructions on how to start learning with edX!', { exact: false })).toBeInTheDocument();
  });
});
