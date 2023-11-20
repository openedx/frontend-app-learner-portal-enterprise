import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
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
  canOnlyViewHighlightSets = false,
}) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <SubsidyRequestsContext.Provider value={initialSubsidyRequestsState}>
        <CourseEnrollmentsContextProvider value={initialCourseEnrollmentsState}>
          <DashboardMainContent canOnlyViewHighlightSets={canOnlyViewHighlightSets} />
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
      adminUsers: [{ email: 'edx@example.com' }],
    },
  };
  it('does not render recommended courses when canOnlyViewHighlightSets true', () => {
    useEnterpriseCuration.mockImplementation(() => ({
      enterpriseCuration: {
        canOnlyViewHighlightSets: true,
      },
    }));
    renderWithRouter(
      <IntlProvider locale="en">
        <DashboardMainContentWrapper
          initialAppState={initialAppState}
          initialUserSubsidyState={defaultUserSubsidyState}
          canOnlyViewHighlightSets
        />
      </IntlProvider>,
    );
    expect(screen.queryByText('Recommend courses for me')).not.toBeInTheDocument();
  });
  it('renders recommended courses when canOnlyViewHighlightSets false', () => {
    useEnterpriseCuration.mockImplementation(() => ({
      enterpriseCuration: {
        canOnlyViewHighlightSets: false,
      },
    }));
    renderWithRouter(
      <IntlProvider locale="en">
        <DashboardMainContentWrapper
          initialAppState={initialAppState}
          initialUserSubsidyState={defaultUserSubsidyState}
          canOnlyViewHighlightSets={false}
        />
      </IntlProvider>,
    );
    expect(screen.getByText('Recommend courses for me')).toBeInTheDocument();
  });
  it('Displays disableSearch Flag message', () => {
    renderWithRouter(
      <IntlProvider locale="en">
        <DashboardMainContentWrapper
          initialAppState={{
            ...initialAppState,
            enterpriseConfig: {
              ...initialAppState.enterpriseConfig,
              disableSearch: true,
            },
          }}
          initialUserSubsidyState={defaultUserSubsidyState}
        />
      </IntlProvider>,
    );
    expect(screen.getByText('Reach out to your administrator for instructions on how to start learning with edX!', { exact: false })).toBeInTheDocument();
  });
});
