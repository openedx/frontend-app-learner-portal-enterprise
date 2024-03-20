import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { camelCaseObject } from '@edx/frontend-platform/utils';
import userEvent from '@testing-library/user-event';
import PathwayProgressListingPage from '../PathwayProgressListingPage';
import { renderWithRouter } from '../../../utils/tests';
import { CONTENT_TYPE_PATHWAY } from '../../search/constants';
import learnerPathwayData from '../data/__mocks__/PathwayProgressListData.json';
import { NO_PATHWAYS_ERROR_MESSAGE } from '../constants';
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

  it('renders pathway error.', () => {
    useEnterprisePathwaysList.mockReturnValue({ data: null, error: { message: 'This is a test message.' } });
    renderWithRouter(
      <PathwayProgressListingWithContext />,
    );
    expect(screen.getByTestId('error-page')).toBeInTheDocument();
  });

  it('renders no pathways message when data received is empty', async () => {
    useEnterprisePathwaysList.mockReturnValue({ data: [] });
    renderWithRouter(
      <PathwayProgressListingWithContext />,
    );
    expect(screen.getByText(NO_PATHWAYS_ERROR_MESSAGE)).toBeInTheDocument();
    expect(screen.getByText('Explore pathways')).toBeInTheDocument();
  });

  it('redirects to correct url when clicked on explore pathways', async () => {
    useEnterprisePathwaysList.mockReturnValue({ data: [] });
    renderWithRouter(
      <PathwayProgressListingWithContext />,
    );
    userEvent.click(screen.getByText('Explore pathways'));
    expect(window.location.pathname).toEqual(`/${mockEnterpriseCustomer.slug}/search`);
    expect(window.location.search).toEqual(`?content_type=${CONTENT_TYPE_PATHWAY}`);
  });

  it('does not render button when canOnlyViewHighlightSets is true', () => {
    useCanOnlyViewHighlights.mockReturnValue({ data: true });
    useEnterprisePathwaysList.mockReturnValue({ data: camelCaseObject(learnerPathwayData) });
    renderWithRouter(
      <PathwayProgressListingWithContext />,
    );
    expect(screen.queryByText('Explore pathways')).not.toBeInTheDocument();
  });
});
