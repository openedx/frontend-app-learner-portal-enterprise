import React from 'react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import EnterpriseInvitePage, {
  LOADING_MESSAGE,
  CTA_BUTTON_TEXT,
} from './EnterpriseInvitePage';
import { postLinkEnterpriseLearner } from './data/service';

import { renderWithRouter } from '../../utils/tests';

jest.mock('./data/service');
jest.mock('@edx/frontend-platform/auth');
jest.mock('@edx/frontend-platform/config');
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));
jest.mock('../error-page', () => ({
  // eslint-disable-next-line react/prop-types
  ErrorPage: ({ children }) => <div data-testid="error-page-message">{children}</div>,
}));

getAuthenticatedUser.mockReturnValue({
  id: 1,
  profileImage: {
    imageUrlMedium: 'htts://img.url',
  },
});
getConfig.mockReturnValue({
  MARKETING_SITE_BASE_URL: 'https://marketing.url',
  LEARNER_SUPPORT_URL: 'https://support.url',
  LOGOUT_URL: 'https://logout.url',
});

const TEST_ENTEPRRISE_SLUG = 'test-enterprise-slug';
const TEST_INVITE_KEY = '00000000-0000-0000-0000-000000000000';
const TEST_ROUTE = `/invite/${TEST_INVITE_KEY}`;

describe('EnterpriseInvitePage', () => {
  beforeEach(() => {
    postLinkEnterpriseLearner.mockReset();
  });

  test('makes call to link user to enterprise and redirects to slug if successful', async () => {
    postLinkEnterpriseLearner.mockResolvedValueOnce({
      data: {
        enterprise_customer_slug: TEST_ENTEPRRISE_SLUG,
      },
    });
    const { history } = renderWithRouter(<EnterpriseInvitePage />, {
      route: TEST_ROUTE,
    });

    // assert component is initially loading but then eventually resolves
    expect(screen.getByText(LOADING_MESSAGE));
    await waitFor(() => expect(screen.queryAllByText(LOADING_MESSAGE)).toHaveLength(0));

    // assert we got redirected to enterprise's slug
    expect(history.location.pathname).toEqual(`/${TEST_ENTEPRRISE_SLUG}`);
  });

  test('handles error when linking user to enterprise', async () => {
    postLinkEnterpriseLearner.mockResolvedValueOnce(new Error('oh noes'));
    const { history } = renderWithRouter(<EnterpriseInvitePage />, {
      route: TEST_ROUTE,
    });

    // assert component is initially loading but then eventually resolves
    expect(screen.queryAllByText(LOADING_MESSAGE)).toHaveLength(1);
    await waitFor(() => expect(screen.queryAllByText(LOADING_MESSAGE)).toHaveLength(0));

    // assert we did NOT get redirected
    expect(history.location.pathname).toEqual(TEST_ROUTE);

    // assert the custom error page messaging renders
    expect(screen.getByText(CTA_BUTTON_TEXT));
  });
});
