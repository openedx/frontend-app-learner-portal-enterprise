import React, { useMemo } from 'react';
import { Route } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';

import AutoActivateLicense from '../AutoActivateLicense';

import { UserSubsidyContext } from '../UserSubsidy';
import { renderWithRouter } from '../../../utils/tests';

const TEST_ENTERPRISE_SLUG = 'test-slug';
const initialPathname = `/${TEST_ENTERPRISE_SLUG}`;

// eslint-disable-next-line react/prop-types
function AutoActivateLicenseWrapper({ subscriptionLicense }) {
  const contextValue = useMemo(() => ({ enterpriseConfig: { slug: TEST_ENTERPRISE_SLUG } }), []);
  const subsidyContextValue = useMemo(() => ({ subscriptionLicense }), [subscriptionLicense]);
  return (
    <Route path={initialPathname} exact>
      <AppContext.Provider value={contextValue}>
        <UserSubsidyContext.Provider value={subsidyContextValue}>
          <AutoActivateLicense />
        </UserSubsidyContext.Provider>
      </AppContext.Provider>
    </Route>
  );
}

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
    const { history } = renderWithRouter(<AutoActivateLicenseWrapper subscriptionLicense={subscriptionLicense} />, {
      route: initialPathname,
    });
    expect(history.location.pathname).toEqual(`/test-slug/licenses/${activationKey}/activate`);
    expect(history.location.state.from).toEqual(initialPathname);
  });
});
