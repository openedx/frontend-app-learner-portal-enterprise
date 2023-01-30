import React from 'react';
import { render, waitFor } from '@testing-library/react';
import Cookies from 'universal-cookie';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import userEvent from '@testing-library/user-event';
import LicenseRequestedAlert from '../LicenseRequestedAlert';
import { CourseContext } from '../CourseContextProvider';
import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { SUBSIDY_REQUEST_STATE, SUBSIDY_TYPE } from '../../enterprise-subsidy-requests/constants';
import { LICENSE_REQUESTED_ALERT_DISMISSED_COOKIE_NAME, LICENSE_REQUESTED_ALERT_HEADING, LICENSE_REQUESTED_ALERT_TEXT } from '../data/constants';

const mockCatalogUUID = 'uuid';
jest.mock('universal-cookie');

const initialSubscriptions = [
  {
    enterpriseCatalogUuid: mockCatalogUUID,
  },
];

const initialLicenseRequests = [
  {
    state: SUBSIDY_REQUEST_STATE.REQUESTED,
  },
];

const LicenseRequestedAlertWrapper = ({
  subscriptions = initialSubscriptions, licenseRequests = initialLicenseRequests,
}) => (
  <IntlProvider locale="en">
    <UserSubsidyContext.Provider value={{
      couponCodes: {
        couponCodes: [],
        couponCodesCount: 0,
      },
      subscriptionLicense: {},
      customerAgreementConfig: {
        subscriptions,
      },
    }}
    >
      <SubsidyRequestsContext.Provider value={
        {
          subsidyRequestConfiguration: null,
          requestsBySubsidyType: {
            [SUBSIDY_TYPE.LICENSE]: licenseRequests,
            [SUBSIDY_TYPE.COUPON]: [],
          },
        }
      }
      >
        <CourseContext.Provider>
          <LicenseRequestedAlert catalogList={[mockCatalogUUID]} />
        </CourseContext.Provider>
      </SubsidyRequestsContext.Provider>
    </UserSubsidyContext.Provider>
  </IntlProvider>
);

describe('<LicenseRequestedAlert />', () => {
  it('renders correctly', () => {
    const { getByText } = render(<LicenseRequestedAlertWrapper />);
    expect(getByText(LICENSE_REQUESTED_ALERT_HEADING));
    expect(getByText(LICENSE_REQUESTED_ALERT_TEXT));
  });

  it('does not render if it was previously dismissed', () => {
    const mockGetCookies = jest.fn(() => true);
    Cookies.mockReturnValue({ get: mockGetCookies });
    const { container } = render(<LicenseRequestedAlertWrapper />);
    expect(container.childElementCount).toEqual(0);
    expect(mockGetCookies).toHaveBeenCalledWith(LICENSE_REQUESTED_ALERT_DISMISSED_COOKIE_NAME);
  });

  it('does not render if there is no pending license request', () => {
    const { container } = render(<LicenseRequestedAlertWrapper licenseRequests={[]} />);
    expect(container.childElementCount).toEqual(0);
  });

  it('does not render if there are no applicable subscriptions', () => {
    const { container } = render(<LicenseRequestedAlertWrapper subscriptions={[{
      enterpriseCatalogUuid: 'abc',
    }]}
    />);
    expect(container.childElementCount).toEqual(0);
  });

  it('sets alert dismissed cookie on close', async () => {
    const mockSetCookies = jest.fn();
    Cookies.mockReturnValue({ get: jest.fn(), set: mockSetCookies });
    const { getByText, queryByText } = render(<LicenseRequestedAlertWrapper />);
    userEvent.click(getByText('Dismiss'));
    expect(mockSetCookies).toHaveBeenCalledWith(
      LICENSE_REQUESTED_ALERT_DISMISSED_COOKIE_NAME,
      true,
      { sameSite: 'strict' },
    );

    await waitFor(() => {
      expect(queryByText(LICENSE_REQUESTED_ALERT_HEADING)).toBeNull();
    });
  });
});
