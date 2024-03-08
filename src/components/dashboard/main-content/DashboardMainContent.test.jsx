import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { useEnterpriseCuration } from '../../search/content-highlights/data';
import DashboardMainContent from './DashboardMainContent';
import { CourseEnrollmentsContextProvider } from './course-enrollments';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';
import { renderWithRouter } from '../../../utils/tests';
import { features } from '../../../config';
import { useContentAssignments } from './course-enrollments/data';
import { emptyRedeemableLearnerCreditPolicies } from '../../app/data';
import { SUBSIDY_TYPE } from '../../../constants';

jest.mock('../../search/content-highlights/data', () => ({
  useEnterpriseCuration: jest.fn(() => ({
    enterpriseCuration: {
      canOnlyViewHighlightSets: jest.fn(),
    },
  })),
}));

jest.mock('../../../config', () => ({
  features: {
    FEATURE_ENABLE_TOP_DOWN_ASSIGNMENT: jest.fn(),
  },
}));

jest.mock('./course-enrollments/data', () => ({
  ...jest.requireActual('./course-enrollments/data'),
  useContentAssignments: jest.fn(),
}));
useContentAssignments.mockReturnValue({
  assignments: [],
  showCanceledAssignmentsAlert: false,
  showExpiredAssignmentsAlert: false,
  handleOnCloseCancelAlert: jest.fn(),
  handleOnCloseExpiredAlert: jest.fn(),
});

const defaultUserSubsidyState = {
  subscriptionPlan: undefined,
  subscriptionLicense: undefined,
  couponCodes: {
    couponCodes: [],
    loading: false,
    couponCodesCount: 0,
  },
  enterpriseOffers: [],
  redeemableLearnerCreditPolicies: emptyRedeemableLearnerCreditPolicies,
};
const defaultAppState = {
  enterpriseConfig: {
    slug: 'slug',
    uuid: 'uuid',
    adminUsers: [{ email: 'edx@example.com' }],
  },
};

const DashboardMainContentWrapper = ({
  initialAppState = defaultAppState,
  initialUserSubsidyState = defaultUserSubsidyState,
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
  it('does not render recommended courses when canOnlyViewHighlightSets true', () => {
    useEnterpriseCuration.mockImplementation(() => ({
      enterpriseCuration: {
        canOnlyViewHighlightSets: true,
      },
    }));
    renderWithRouter(
      <IntlProvider locale="en">
        <DashboardMainContentWrapper
          canOnlyViewHighlightSets
        />
      </IntlProvider>,
    );
    expect(screen.queryByText('Recommend courses for me')).not.toBeInTheDocument();
  });
  it('renders recommended courses when canOnlyViewHighlightSets false', () => {
    features.FEATURE_ENABLE_TOP_DOWN_ASSIGNMENT.mockImplementation(() => true);
    useEnterpriseCuration.mockImplementation(() => ({
      enterpriseCuration: {
        canOnlyViewHighlightSets: false,
      },
    }));
    renderWithRouter(
      <IntlProvider locale="en">
        <DashboardMainContentWrapper
          canOnlyViewHighlightSets={false}
        />
      </IntlProvider>,
    );
    expect(screen.getByText('Recommend courses for me')).toBeInTheDocument();
  });

  it('Displays disableSearch flag message', () => {
    const appState = {
      ...defaultAppState,
      enterpriseConfig: {
        ...defaultAppState.enterpriseConfig,
        disableSearch: true,
      },
    };
    renderWithRouter(
      <IntlProvider locale="en">
        <DashboardMainContentWrapper
          initialAppState={appState}
        />
      </IntlProvider>,
    );
    expect(screen.getByText('Reach out to your administrator for instructions on how to start learning with edX!', { exact: false })).toBeInTheDocument();
  });
});
