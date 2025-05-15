import { waitFor } from '@testing-library/react';
import Cookies from 'universal-cookie';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import userEvent from '@testing-library/user-event';
import { AppContext } from '@edx/frontend-platform/react';
import { useParams } from 'react-router-dom';
import LicenseRequestedAlert from '../LicenseRequestedAlert';
import {
  LICENSE_REQUESTED_ALERT_DISMISSED_COOKIE_NAME,
  LICENSE_REQUESTED_ALERT_HEADING,
  LICENSE_REQUESTED_ALERT_TEXT,
} from '../data/constants';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';
import {
  useBrowseAndRequest,
  useEnterpriseCustomer,
  useEnterpriseCustomerContainsContentSuspense,
  useSubscriptions,
} from '../../app/data';
import { renderWithRouterProvider } from '../../../utils/tests';

const mockCatalogUUID = 'uuid';
jest.mock('universal-cookie');

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useEnterpriseCustomerContainsContentSuspense: jest.fn(),
  useSubscriptions: jest.fn(),
  useBrowseAndRequest: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}
));

const mockAuthenticatedUser = authenticatedUserFactory();
const LicenseRequestedAlertWrapper = () => (
  <IntlProvider locale="en">
    <AppContext.Provider value={mockAuthenticatedUser}>
      <LicenseRequestedAlert />
    </AppContext.Provider>
  </IntlProvider>
);

const mockEnterpriseCustomer = enterpriseCustomerFactory();

describe('<LicenseRequestedAlert />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useParams.mockReturnValue({ courseKey: 'edX+DemoX' });
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useEnterpriseCustomerContainsContentSuspense.mockReturnValue({
      data: {
        containsContentItems: false,
        catalogList: [],
      },
    });
    useBrowseAndRequest.mockReturnValue({
      data: {
        configuration: undefined,
        requests: {
          subscriptionLicenses: [],
          couponCodes: [],
        },
      },
    });
    useSubscriptions.mockReturnValue({
      data: {
        customerAgreement: undefined,
        subscriptionLicense: undefined,
        subscriptionPlan: undefined,
      },
    });
  });
  it('renders correctly', () => {
    useBrowseAndRequest.mockReturnValue({
      data: {
        requests: {
          subscriptionLicenses: [mockCatalogUUID],
        },
      },
    });
    useEnterpriseCustomerContainsContentSuspense.mockReturnValue({
      data: {
        catalogList: [mockCatalogUUID],
      },
    });
    useSubscriptions.mockReturnValue({
      data: {
        customerAgreement: {
          availableSubscriptionCatalogs: [mockCatalogUUID],
        },
      },
    });
    const { getByText } = renderWithRouterProvider(<LicenseRequestedAlertWrapper />);

    expect(getByText(LICENSE_REQUESTED_ALERT_HEADING));
    expect(getByText(LICENSE_REQUESTED_ALERT_TEXT));
  });

  it('does not render if it was previously dismissed', () => {
    const mockGetCookies = jest.fn(() => true);
    Cookies.mockReturnValue({ get: mockGetCookies });
    const { container } = renderWithRouterProvider(<LicenseRequestedAlertWrapper />);
    expect(container.childElementCount).toEqual(0);
    expect(mockGetCookies).toHaveBeenCalledWith(LICENSE_REQUESTED_ALERT_DISMISSED_COOKIE_NAME);
  });

  it('does not render if there is no pending license request', () => {
    const { container } = renderWithRouterProvider(<LicenseRequestedAlertWrapper />);
    expect(container.childElementCount).toEqual(0);
  });

  it('does not render if there are no applicable subscriptions', () => {
    const { container } = renderWithRouterProvider(<LicenseRequestedAlertWrapper />);
    expect(container.childElementCount).toEqual(0);
  });

  it('sets alert dismissed cookie on close', async () => {
    const user = userEvent.setup();
    const mockSetCookies = jest.fn();
    Cookies.mockReturnValue({ get: jest.fn(), set: mockSetCookies });
    useBrowseAndRequest.mockReturnValue({
      data: {
        requests: {
          subscriptionLicenses: [mockCatalogUUID],
        },
      },
    });
    useEnterpriseCustomerContainsContentSuspense.mockReturnValue({
      data: {
        catalogList: [mockCatalogUUID],
      },
    });
    useSubscriptions.mockReturnValue({
      data: {
        customerAgreement: {
          availableSubscriptionCatalogs: [mockCatalogUUID],
        },
      },
    });
    const { getByText, queryByText } = renderWithRouterProvider(<LicenseRequestedAlertWrapper />);
    await user.click(getByText('Dismiss'));
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
