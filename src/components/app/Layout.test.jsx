import { screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { mergeConfig } from '@edx/frontend-platform';
import dayjs from 'dayjs';
import '@testing-library/jest-dom/extend-expect';

import Layout from './Layout';
import { queryClient, renderWithRouterProvider } from '../../utils/tests';
import { useEnterpriseLearner } from './data';

const mockDefaultAppContextValue = {
  authenticatedUser: {
    userId: 3,
  },
  config: {
    LMS_BASE_URL: 'https://test-lms.url',
  },
};

const mockEnterpriseCustomer = {
  uuid: 'test-enterprise-uuid',
  brandingConfiguration: {
    logo: 'https://test-logo.url',
    primaryColor: '#000000',
    secondaryColor: '#FF0000',
    tertiaryColor: '#0000FF',
  },
};

jest.mock('@edx/frontend-component-footer', () => jest.fn(() => <div data-testid="site-footer" />));
jest.mock('../site-header', () => ({
  ...jest.requireActual('../site-header'),
  SiteHeader: jest.fn(() => <div data-testid="site-header" />),
}));
jest.mock('../enterprise-banner', () => ({
  ...jest.requireActual('../enterprise-banner'),
  EnterpriseBanner: jest.fn(() => <div data-testid="enterprise-banner" />),
}));
jest.mock('../../utils/common', () => ({
  ...jest.requireActual('../../utils/common'),
  getBrandColorsFromCSSVariables: jest.fn().mockReturnValue({
    white: '#FFFFFF',
    dark: '#000000',
  }),
}));

jest.mock('./data', () => ({
  ...jest.requireActual('./data'),
  useEnterpriseLearner: jest.fn().mockReturnValue({
    data: {
      enterpriseCustomer: null,
    },
  }),
}));

const LayoutWrapper = ({
  appContextValue = mockDefaultAppContextValue,
}) => (
  <QueryClientProvider client={queryClient()}>
    <IntlProvider locale="en">
      <AppContext.Provider value={appContextValue}>
        <Layout />
      </AppContext.Provider>
    </IntlProvider>
  </QueryClientProvider>
);

describe('Layout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the not found page when the user is not linked to an enterprise customer', () => {
    renderWithRouterProvider(<LayoutWrapper />);
    expect(screen.getByText('404', { selector: 'h1' })).toBeInTheDocument();
  });

  it.each([
    {
      isSystemMaintenanceAlertOpen: false,
      maintenanceMessage: undefined,
      maintenanceStartTimestamp: undefined,
    },
    {
      isSystemMaintenanceAlertOpen: true,
      maintenanceMessage: 'Hello World!',
      maintenanceStartTimestamp: undefined,
    },
    {
      isSystemMaintenanceAlertOpen: true,
      maintenanceMessage: 'Hello World!',
      maintenanceStartTimestamp: dayjs().subtract(1, 'm').toISOString(),
    },
    {
      isSystemMaintenanceAlertOpen: false,
      maintenanceMessage: 'Hello World!',
      maintenanceStartTimestamp: dayjs().add(1, 'm').toISOString(),
    },
  ])('renders with enterprise customer (%s)', ({
    isSystemMaintenanceAlertOpen,
    maintenanceMessage,
    maintenanceStartTimestamp,
  }) => {
    useEnterpriseLearner.mockReturnValue({
      data: {
        enterpriseCustomer: mockEnterpriseCustomer,
      },
    });

    if (maintenanceMessage) {
      mergeConfig({
        IS_MAINTENANCE_ALERT_ENABLED: isSystemMaintenanceAlertOpen,
        MAINTENANCE_ALERT_MESSAGE: maintenanceMessage,
      });
    }
    if (maintenanceStartTimestamp) {
      mergeConfig({
        MAINTENANCE_ALERT_START_TIMESTAMP: maintenanceStartTimestamp ?? '',
      });
    }

    renderWithRouterProvider({
      path: '/:enterpriseSlug',
      element: <LayoutWrapper />,
      children: [
        {
          path: '',
          element: <div data-testid="child-route" />,
        },
      ],
    }, {
      initialEntries: ['/test-enterprise'],
    });
    expect(screen.getByTestId('site-header')).toBeInTheDocument();
    expect(screen.getByTestId('enterprise-banner')).toBeInTheDocument();
    expect(screen.getByTestId('child-route')).toBeInTheDocument();
    expect(screen.getByTestId('site-footer')).toBeInTheDocument();

    if (isSystemMaintenanceAlertOpen) {
      expect(screen.getByText(maintenanceMessage)).toBeInTheDocument();
    } else if (maintenanceMessage) {
      expect(screen.queryByText(maintenanceMessage)).not.toBeInTheDocument();
    }
  });
});
