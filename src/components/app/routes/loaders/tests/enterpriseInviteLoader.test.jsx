import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { renderWithRouterProvider } from '../../../../../utils/tests';
import enterpriseInviteLoader from '../enterpriseInviteLoader';
import {
  extractEnterpriseId, postLinkEnterpriseLearner,
} from '../../../data';
import EnterpriseInviteRoute from '../../EnterpriseInviteRoute';
import { ensureAuthenticatedUser } from '../../data';

jest.mock('../../data', () => ({
  ...jest.requireActual('../../data'),
  ensureAuthenticatedUser: jest.fn(),
}));
jest.mock('../../../data', () => ({
  ...jest.requireActual('../../../data'),
  extractEnterpriseId: jest.fn(),
  postLinkEnterpriseLearner: jest.fn(),
}));
jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  configure: jest.fn(),
}));
jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  configure: jest.fn(),
  getLoggingService: jest.fn(),
  logError: jest.fn(),
}));
jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn().mockReturnValue({
    LEARNER_SUPPORT_URL: 'https://test-learner-support-url',
    MARKETING_SITE_BASE_URL: 'https://test-marketing-site-base-url',
  }),
}));

const mockEnterpriseId = 'test-enterprise-uuid';
const mockEnterpriseSlug = 'test-enterprise-slug';
const mockEnterpriseCustomerInviteKey = 'test-enterprise-customer-invite-key';
extractEnterpriseId.mockResolvedValue(mockEnterpriseId);
postLinkEnterpriseLearner.mockResolvedValue({
  enterpriseCustomerSlug: mockEnterpriseSlug,
});

const EnterpriseInviteRouteWrapper = () => (
  <IntlProvider locale="en">
    <EnterpriseInviteRoute />
  </IntlProvider>
);

describe('enterpriseInviteLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ensureAuthenticatedUser.mockResolvedValue({ userId: 3 });
  });

  it('handles unauthenticated users by redirecting to the root', async () => {
    ensureAuthenticatedUser.mockResolvedValue(null);
    renderWithRouterProvider({
      path: '/invite/:enterpriseCustomerInviteKey',
      element: <EnterpriseInviteRouteWrapper />,
      loader: enterpriseInviteLoader,
    }, {
      routes: [
        {
          path: '/',
          element: <div data-testid="root" />,
        },
      ],
      initialEntries: [`/invite/${mockEnterpriseCustomerInviteKey}`],
    });

    await waitFor(() => {
      expect(screen.getByTestId('root')).toBeInTheDocument();
    });

    expect(postLinkEnterpriseLearner).not.toHaveBeenCalled();
  });

  it('redirects to dashboard upon successful linking of user <> enterprise customer', async () => {
    renderWithRouterProvider({
      path: '/invite/:enterpriseCustomerInviteKey',
      element: <div data-testid="invite-link" />,
      loader: enterpriseInviteLoader,
    }, {
      routes: [
        {
          path: '/:enterpriseSlug?',
          element: <div data-testid="enterprise-app" />,
        },
      ],
      initialEntries: [`/invite/${mockEnterpriseCustomerInviteKey}`],
    });

    await waitFor(() => {
      expect(screen.getByTestId('enterprise-app')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('invite-link')).not.toBeInTheDocument();
  });

  it('does NOT redirect to dashboard when error occurs during linking of user <> enterprise customer', async () => {
    postLinkEnterpriseLearner.mockRejectedValue(new Error('test-error'));
    renderWithRouterProvider({
      path: '/invite/:enterpriseCustomerInviteKey',
      element: <EnterpriseInviteRouteWrapper />,
      loader: enterpriseInviteLoader,
    }, {
      routes: [
        {
          path: '/:enterpriseSlug?',
          element: <div data-testid="enterprise-app" />,
        },
      ],
      initialEntries: [`/invite/${mockEnterpriseCustomerInviteKey}`],
    });

    await waitFor(() => {
      expect(screen.getByTestId('enterprise-invite-error')).toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-app')).not.toBeInTheDocument();
    });

    expect(postLinkEnterpriseLearner).toHaveBeenCalledTimes(1);
    expect(postLinkEnterpriseLearner).toHaveBeenCalledWith(mockEnterpriseCustomerInviteKey);
  });
});
