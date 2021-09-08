import React from 'react';
import { Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';

import ActivateLicenseAlert from '../ActivateLicenseAlert';

import { UserSubsidyContext } from '../UserSubsidy';
import { renderWithRouter } from '../../../utils/tests';

const TEST_ENTERPRISE_SLUG = 'test-slug';

describe('<ActivateLicenseAlert />', () => {
  test('does not render alert when no license exists', () => {
    const Component = (
      <Route path="/:enterpriseSlug">
        <UserSubsidyContext.Provider value={{ subscriptionLicense: null }}>
          <ActivateLicenseAlert />
        </UserSubsidyContext.Provider>
      </Route>
    );
    renderWithRouter(Component, {
      route: `/${TEST_ENTERPRISE_SLUG}`,
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test.each(
    ['activated', 'revoked'],
  )('does not render alert when license status is %s', (status) => {
    const subscriptionLicense = { status };
    const Component = (
      <Route path="/:enterpriseSlug">
        <UserSubsidyContext.Provider value={{ subscriptionLicense }}>
          <ActivateLicenseAlert />
        </UserSubsidyContext.Provider>
      </Route>
    );
    renderWithRouter(Component, {
      route: `/${TEST_ENTERPRISE_SLUG}`,
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('renders alert when license status is assigned', () => {
    const subscriptionLicense = { status: 'assigned' };
    const Component = (
      <Route path="/:enterpriseSlug">
        <UserSubsidyContext.Provider value={{ subscriptionLicense }}>
          <ActivateLicenseAlert />
        </UserSubsidyContext.Provider>
      </Route>
    );
    renderWithRouter(Component, {
      route: `/${TEST_ENTERPRISE_SLUG}`,
    });
    expect(screen.getByRole('alert')).toBeTruthy();
  });
});
