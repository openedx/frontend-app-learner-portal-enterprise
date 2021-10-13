import React from 'react';
import { Route } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import ActivateLicenseAlert from '../ActivateLicenseAlert';

import { UserSubsidyContext } from '../UserSubsidy';
import { renderWithRouter } from '../../../utils/tests';

const TEST_ENTERPRISE_SLUG = 'test-slug';

// eslint-disable-next-line react/prop-types
const ActivateLicenseAlertWrapper = ({ subscriptionLicense }) => (
  <Route path="/:enterpriseSlug">
    <AppContext.Provider value={{ enterpriseConfig: { slug: TEST_ENTERPRISE_SLUG } }}>
      <UserSubsidyContext.Provider value={{ subscriptionLicense }}>
        <ActivateLicenseAlert />
      </UserSubsidyContext.Provider>
    </AppContext.Provider>
  </Route>
);

describe('<ActivateLicenseAlert />', () => {
  test('does not render alert when no license exists', () => {
    renderWithRouter(<ActivateLicenseAlertWrapper subscriptionLicense={null} />, {
      route: `/${TEST_ENTERPRISE_SLUG}`,
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test.each(
    ['activated', 'revoked'],
  )('does not render alert when license status is %s', (status) => {
    const subscriptionLicense = { status };
    renderWithRouter(<ActivateLicenseAlertWrapper subscriptionLicense={subscriptionLicense} />, {
      route: `/${TEST_ENTERPRISE_SLUG}`,
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('renders alert when license status is assigned', () => {
    const subscriptionLicense = { status: 'assigned', activationKey: 'test-uuid' };
    renderWithRouter(<ActivateLicenseAlertWrapper subscriptionLicense={subscriptionLicense} />, {
      route: `/${TEST_ENTERPRISE_SLUG}`,
    });
    expect(screen.getByRole('alert')).toBeTruthy();
    const activationLink = `/${TEST_ENTERPRISE_SLUG}/licenses/${subscriptionLicense.activationKey}/activate`;
    expect(screen.getByRole('link')).toHaveAttribute('href', activationLink);
  });
});
