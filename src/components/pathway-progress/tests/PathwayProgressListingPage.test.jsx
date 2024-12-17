import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import PathwayProgressListingPage from '../PathwayProgressListingPage';
import { renderWithRouter } from '../../../utils/tests';
import learnerPathwayData from '../data/__mocks__/PathwayProgressListData.json';
import { useEnterpriseCustomer, useCanOnlyViewHighlights, useEnterprisePathwaysList } from '../../app/data';
import { enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

jest.mock('@edx/frontend-platform/react', () => ({
  ...jest.requireActual('@edx/frontend-platform/react'),
  ErrorPage: () => <div data-testid="error-page" />,
}));

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useCanOnlyViewHighlights: jest.fn(),
  useEnterprisePathwaysList: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();

const PathwayProgressListingWithContext = ({
  initialAppState = {},
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <PathwayProgressListingPage />
    </AppContext.Provider>
  </IntlProvider>
);

describe('<PathwayProgressListingPage />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useCanOnlyViewHighlights.mockReturnValue({ data: false });
    useEnterprisePathwaysList.mockReturnValue({ data: [], error: null });
  });

  it('renders all pathway cards', async () => {
    useEnterprisePathwaysList.mockReturnValue({ data: camelCaseObject(learnerPathwayData), error: null });
    renderWithRouter(
      <PathwayProgressListingWithContext />,
    );
    expect(screen.getByText('test 1')).toBeInTheDocument();
    expect(screen.getByText('test 2')).toBeInTheDocument();
    expect(screen.getByText('test 3')).toBeInTheDocument();
  });
});
