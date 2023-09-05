import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import Cookies from 'universal-cookie';

import { mockNavigate } from 'react-router-dom';
import { renderWithRouter } from '../../../utils/tests';
import EnterpriseLearnerFirstVisitRedirect from '../EnterpriseLearnerFirstVisitRedirect';

const COOKIE_NAME = 'has-user-visited-learner-dashboard';
const TEST_ENTERPRISE = {
  uuid: 'some-fake-uuid',
  name: 'Test Enterprise',
  slug: 'test-enterprise',
};

jest.mock('react-router-dom', () => {
  const mockNavigation = jest.fn();

  // eslint-disable-next-line react/prop-types
  const Navigate = ({ to }) => {
    mockNavigation(to);
    return <div />;
  };

  return {
    ...jest.requireActual('react-router-dom'),
    Navigate,
    mockNavigate: mockNavigation,
  };
});

describe('<EnterpriseLearnerFirstVisitRedirect />', () => {
  beforeEach(() => {
    const cookies = new Cookies();
    cookies.remove(COOKIE_NAME);
    jest.clearAllMocks();
  });

  test('redirects to search if user is visiting for the first time.', async () => {
    renderWithRouter(<EnterpriseLearnerFirstVisitRedirect />, { route: `/${TEST_ENTERPRISE.slug}` });
    expect(mockNavigate).toHaveBeenCalledWith('/r/search');
  });

  test('Does not redirect the returning user to search.', async () => {
    // Simulate a returning user by setting the cookie.
    const cookies = new Cookies();
    cookies.set(COOKIE_NAME, true);

    const { history } = renderWithRouter(<EnterpriseLearnerFirstVisitRedirect />, { route: `/${TEST_ENTERPRISE.slug}` });
    expect(history.location.pathname).toEqual(`/${TEST_ENTERPRISE.slug}`);
  });

  test('Does not redirect the returning user to search if experiment is disabled.', async () => {
    // Simulate a returning user by setting the cookie.
    const cookies = new Cookies();
    cookies.set(COOKIE_NAME, true);

    const { history } = renderWithRouter(<EnterpriseLearnerFirstVisitRedirect />, { route: `/${TEST_ENTERPRISE.slug}` });
    expect(history.location.pathname).toEqual(`/${TEST_ENTERPRISE.slug}`);
  });
});
