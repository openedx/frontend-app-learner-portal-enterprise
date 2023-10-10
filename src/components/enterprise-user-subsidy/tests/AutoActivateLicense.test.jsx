import React from 'react';
import {
  MemoryRouter, Route, Routes, mockNavigate,
} from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';

import { render } from '@testing-library/react';
import AutoActivateLicense from '../AutoActivateLicense';

import { UserSubsidyContext } from '../UserSubsidy';
import { renderWithRouter } from '../../../utils/tests';

const TEST_ENTERPRISE_SLUG = 'test-slug';
const initialPathname = `/${TEST_ENTERPRISE_SLUG}`;

jest.mock('react-router-dom', () => {
  const mockNavigation = jest.fn();

  // eslint-disable-next-line react/prop-types
  const Navigate = ({ to, state }) => {
    mockNavigation(to, state);
    return <div />;
  };

  return {
    ...jest.requireActual('react-router-dom'),
    Navigate,
    mockNavigate: mockNavigation,
  };
});

const AutoActivateLicenseWrapper = ({ subscriptionLicense }) => (
  <Routes>
    <Route
      path={initialPathname}
      element={(
        <AppContext.Provider value={{ enterpriseConfig: { slug: TEST_ENTERPRISE_SLUG } }}>
          <UserSubsidyContext.Provider value={{ subscriptionLicense }}>
            <AutoActivateLicense />
          </UserSubsidyContext.Provider>
        </AppContext.Provider>
      )}
    />
  </Routes>
);

describe('<AutoActivationLicense />', () => {
  afterEach(() => jest.clearAllMocks());

  it('does not render when no license exists', () => {
    const { history } = renderWithRouter(<AutoActivateLicenseWrapper subscriptionLicense={null} />, {
      route: initialPathname,
    });
    expect(history.location.pathname).toEqual(initialPathname);
  });

  it.each(
    ['activated', 'revoked'],
  )('does not render when license status is %s', (status) => {
    const subscriptionLicense = { status };
    const { history } = renderWithRouter(<AutoActivateLicenseWrapper subscriptionLicense={subscriptionLicense} />, {
      route: initialPathname,
    });
    expect(history.location.pathname).toEqual(initialPathname);
  });

  test('renders when license status is assigned', () => {
    const activationKey = 'test-uuid';
    const subscriptionLicense = { status: 'assigned', activationKey };
    render(
      <MemoryRouter initialEntries={[initialPathname]}>
        <AutoActivateLicenseWrapper
          subscriptionLicense={subscriptionLicense}
        />
      </MemoryRouter>,

    );
    expect(mockNavigate).toHaveBeenCalledWith(`/test-slug/licenses/${activationKey}/activate`, { from: initialPathname });
  });
});
