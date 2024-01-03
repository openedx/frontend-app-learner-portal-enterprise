import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import Cookies from 'universal-cookie';
import { renderWithRouter } from '../../../utils/tests';
import EnterpriseLearnerFirstVisitRedirect from '../EnterpriseLearnerFirstVisitRedirect';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { emptyRedeemableLearnerCreditPolicies } from '../../enterprise-user-subsidy/data/constants';

const COOKIE_NAME = 'has-user-visited-learner-dashboard';
const TEST_ENTERPRISE = {
  uuid: 'some-fake-uuid',
  name: 'Test Enterprise',
  slug: 'test-enterprise',
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({
    enterpriseSlug: TEST_ENTERPRISE.slug,
  }),
}));

const defaultUserSubsidyState = {
  redeemableLearnerCreditPolicies: {
    redeemablePolicies: [
      {
        learnerContentAssignments: [
          { state: 'allocated' },
        ],
      },
      {
        learnerContentAssignments: [
          { state: 'cancelled' },
        ],
      },
    ],
    learnerContentAssignments: {
      ...emptyRedeemableLearnerCreditPolicies.learnerContentAssignments,
      assignments: [{ state: 'allocated' }, { state: 'cancelled' }],
      hasAssignments: true,
      allocatedAssignments: [{ state: 'allocated' }],
      hasAllocatedAssignments: true,
      canceledAssignments: [{ state: 'cancelled' }],
      hasCanceledAssignments: true,
      assignmentsForDisplay: [{ state: 'allocated' }, { state: 'cancelled' }],
      hasAssignmentsForDisplay: true,
    },
  },
};

const EnterpriseLearnerFirstVisitRedirectWrapper = ({
  initialUserSubsidyState = defaultUserSubsidyState,
}) => (
  <UserSubsidyContext.Provider value={initialUserSubsidyState}>
    <EnterpriseLearnerFirstVisitRedirect />
  </UserSubsidyContext.Provider>
);

describe('<EnterpriseLearnerFirstVisitRedirect />', () => {
  beforeEach(() => {
    const cookies = new Cookies();
    cookies.remove(COOKIE_NAME);
  });

  test('redirects to search if user is visiting for the first time.', async () => {
    const noActiveCourseAssignmentUserSubsidyState = {
      ...defaultUserSubsidyState,
      redeemableLearnerCreditPolicies: emptyRedeemableLearnerCreditPolicies,
    };

    const { history } = renderWithRouter(<EnterpriseLearnerFirstVisitRedirectWrapper initialUserSubsidyState={noActiveCourseAssignmentUserSubsidyState} />, { route: `/${TEST_ENTERPRISE.slug}` });
    expect(history.location.pathname).toEqual(`/${TEST_ENTERPRISE.slug}/search`);
  });

  test('redirects to search if the course assigned is not active.', async () => {
    const noActiveCourseAssignmentUserSubsidyState = {
      ...defaultUserSubsidyState,
      redeemableLearnerCreditPolicies: emptyRedeemableLearnerCreditPolicies,
    };

    const { history } = renderWithRouter(<EnterpriseLearnerFirstVisitRedirectWrapper initialUserSubsidyState={noActiveCourseAssignmentUserSubsidyState} />, { route: `/${TEST_ENTERPRISE.slug}` });
    expect(history.location.pathname).toEqual(`/${TEST_ENTERPRISE.slug}/search`);
  });

  test('Does not redirect the returning user to search.', async () => {
    // Simulate a returning user by setting the cookie.
    const cookies = new Cookies();
    cookies.set(COOKIE_NAME, true);

    const { history } = renderWithRouter(<EnterpriseLearnerFirstVisitRedirectWrapper />, { route: `/${TEST_ENTERPRISE.slug}` });
    expect(history.location.pathname).toEqual(`/${TEST_ENTERPRISE.slug}`);
  });

  test('Does not redirect the returning user to search if experiment is disabled.', async () => {
    // Simulate a returning user by setting the cookie.
    const cookies = new Cookies();
    cookies.set(COOKIE_NAME, true);

    const { history } = renderWithRouter(<EnterpriseLearnerFirstVisitRedirectWrapper />, { route: `/${TEST_ENTERPRISE.slug}` });
    expect(history.location.pathname).toEqual(`/${TEST_ENTERPRISE.slug}`);
  });
});
