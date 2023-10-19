import React from 'react';

import { AppContext } from '@edx/frontend-platform/react';
import {
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import * as logging from '@edx/frontend-platform/logging';
import { MemoryRouter } from 'react-router-dom';

import EnterpriseInvitePage, {
  LOADING_MESSAGE,
  CTA_BUTTON_TEXT,
} from './EnterpriseInvitePage';
import { postLinkEnterpriseLearner } from './data/service';
import * as utils from '../../utils/common';

jest.mock('@edx/frontend-enterprise-logistration', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-logistration'),
  LoginRedirect: ({ children }) => <div data-testid="login-redirect">{children}</div>,
}));

jest.mock('../../utils/common', () => ({
  loginRefresh: jest.fn(),
}));
jest.mock('./data/service');
jest.mock('@edx/frontend-platform/auth');
jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn().mockReturnValue({
    MARKETING_SITE_BASE_URL: 'https://marketing.url',
    LEARNER_SUPPORT_URL: 'https://support.url',
    LOGOUT_URL: 'https://logout.url',
  }),
}));
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));
jest.mock('../error-page', () => ({
  ErrorPage: ({ children }) => <div data-testid="error-page-message">{children}</div>,
}));
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const TEST_ENTEPRRISE_SLUG = 'test-enterprise-slug';
const TEST_INVITE_KEY = '00000000-0000-0000-0000-000000000000';
const TEST_ROUTE = `/invite/${TEST_INVITE_KEY}`;

const initialAppContextValue = {
  configuration: {},
  authenticatedUser: {
    id: 1,
    profileImage: {
      imageUrlMedium: 'htts://img.url',
    },
  },
};

const EnterpriseInvitePageWrapper = ({
  appContextValue = initialAppContextValue,
}) => (
  <AppContext.Provider value={appContextValue}>
    <EnterpriseInvitePage />
  </AppContext.Provider>
);

describe('EnterpriseInvitePage', () => {
  beforeEach(() => jest.clearAllMocks());

  test('makes call to link user to enterprise, refreshes login, and redirects to slug', async () => {
    postLinkEnterpriseLearner.mockResolvedValueOnce({
      data: {
        enterprise_customer_slug: TEST_ENTEPRRISE_SLUG,
      },
    });
    render(<MemoryRouter initialEntries={[TEST_ROUTE]}><EnterpriseInvitePageWrapper /></MemoryRouter>);
    expect(screen.getByText(LOADING_MESSAGE)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryAllByText(LOADING_MESSAGE)).toHaveLength(0);
    });

    expect(utils.loginRefresh).toHaveBeenCalledTimes(1);
    // assert we got redirected to enterprise's slug
    expect(mockNavigate).toHaveBeenCalledWith(`/${TEST_ENTEPRRISE_SLUG}`, { replace: true });
  });

  test('redirects to slug if successful linked user even if login refresh fails', async () => {
    postLinkEnterpriseLearner.mockResolvedValueOnce({
      data: {
        enterprise_customer_slug: TEST_ENTEPRRISE_SLUG,
      },
    });
    const loginRefreshError = new Error('login refresh error');
    utils.loginRefresh.mockRejectedValueOnce(loginRefreshError);
    render(<MemoryRouter initialEntries={[TEST_ROUTE]}><EnterpriseInvitePageWrapper /></MemoryRouter>);

    await waitFor(() => expect(utils.loginRefresh).toHaveBeenCalledTimes(1));

    expect(logging.logError).toHaveBeenCalledWith(loginRefreshError);

    // assert we got redirected to enterprise's slug
    expect(mockNavigate).toHaveBeenCalledWith(`/${TEST_ENTEPRRISE_SLUG}`, { replace: true });
  });

  test('handles error when linking user to enterprise', async () => {
    const error = new Error('oh noes');
    postLinkEnterpriseLearner.mockRejectedValueOnce(error);

    render(<MemoryRouter initialEntries={[TEST_ROUTE]}><EnterpriseInvitePageWrapper /></MemoryRouter>);

    await waitFor(() => expect(screen.queryAllByText(LOADING_MESSAGE)).toHaveLength(0));

    expect(logging.logError).toHaveBeenCalledWith(error);
    expect(utils.loginRefresh).not.toHaveBeenCalled();

    // assert we did NOT get redirected
    expect(mockNavigate).not.toHaveBeenCalled();

    // assert the custom error page messaging renders
    await waitFor(() => {
      expect(screen.getByText(CTA_BUTTON_TEXT)).toBeInTheDocument();
    });
  });
});
