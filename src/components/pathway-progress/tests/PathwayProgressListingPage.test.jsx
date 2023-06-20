import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import {
  screen, render, act,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { camelCaseObject } from '@edx/frontend-platform/utils';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Link } from 'react-router-dom';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import PathwayProgressListingPage from '../PathwayProgressListingPage';
import { useInProgressPathwaysData } from '../data/hooks';
import { renderWithRouter } from '../../../utils/tests';
import { CONTENT_TYPE_PATHWAY } from '../../search/constants';
import learnerPathwayData from '../data/__mocks__/PathwayProgressListData.json';
import { NO_PATHWAYS_ERROR_MESSAGE } from '../constants';

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: () => ({ username: 'b.wayne' }),
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('@edx/frontend-platform/react', () => ({
  ...jest.requireActual('@edx/frontend-platform/react'),
  ErrorPage: () => <div data-testid="error-page" />,
}));

jest.mock('../data/hooks', () => ({
  useInProgressPathwaysData: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: jest.fn().mockImplementation(({ to, children }) => (
    <a href={to}>{children}</a>
  )),
}));

const PathwayProgressListingWithContext = ({
  initialAppState = {},
  initialUserSubsidyState = {},
  canOnlyViewHighlightSets = false,
  pathwayProgressData = [],
  pathwayFetchError = null,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <UserSubsidyContext.Provider value={initialUserSubsidyState}>
        <PathwayProgressListingPage
          canOnlyViewHighlightSets={canOnlyViewHighlightSets}
          pathwayProgressData={pathwayProgressData}
          pathwayFetchError={pathwayFetchError}
        />
      </UserSubsidyContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);

describe('<PathwayProgressListingPage />', () => {
  const initialAppState = {
    enterpriseConfig: {
      slug: 'test-enterprise-slug',
      name: 'Test Enterprise',
    },
  };

  const initialUserSubsidyState = {
    subscriptionLicense: {
      uuid: 'test-license-uuid',
    },
    couponCodes: {
      couponCodes: [],
      couponCodesCount: 0,
    },
  };

  it('renders all pathway cards', async () => {
    useInProgressPathwaysData.mockImplementation(() => ([camelCaseObject(learnerPathwayData), null]));

    await act(async () => {
      render(
        <BrowserRouter>
          <PathwayProgressListingWithContext
            initialAppState={initialAppState}
            initialUserSubsidyState={initialUserSubsidyState}
            pathwayProgressData={camelCaseObject(learnerPathwayData)}
          />
        </BrowserRouter>,
      );
      expect(screen.getByText('test 1')).toBeInTheDocument();
      expect(screen.getByText('test 2')).toBeInTheDocument();
      expect(screen.getByText('test 3')).toBeInTheDocument();
    });
  });

  it('renders pathway error.', () => {
    useInProgressPathwaysData.mockImplementation(() => ([{}, { message: 'This is a test message.' }]));
    render(
      <PathwayProgressListingWithContext
        initialAppState={initialAppState}
        initialUserSubsidyState={initialUserSubsidyState}
        pathwayFetchError={{ message: 'This is a test message.' }}
      />,
    );
    expect(screen.getByTestId('error-page')).toBeInTheDocument();
  });

  it('renders no pathways message when data received is empty', async () => {
    useInProgressPathwaysData.mockImplementation(() => ([[], null]));

    await act(async () => {
      renderWithRouter(
        <PathwayProgressListingWithContext
          initialAppState={initialAppState}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );
      expect(screen.getByText(NO_PATHWAYS_ERROR_MESSAGE)).toBeInTheDocument();
      expect(screen.getByText('Explore pathways')).toBeInTheDocument();
    });
  });

  it('redirects to correct url when clicked on explore pathways', async () => {
    useInProgressPathwaysData.mockImplementation(() => ([[], null]));

    await act(async () => {
      renderWithRouter(
        <PathwayProgressListingWithContext
          initialAppState={initialAppState}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );
      userEvent.click(screen.getByText('Explore pathways'));

      expect(Link).toHaveBeenCalled();
      expect(Link).toHaveBeenCalledWith(
        expect.objectContaining({
          to: `/${initialAppState.enterpriseConfig.slug}/search?content_type=${CONTENT_TYPE_PATHWAY}`,
        }),
        expect.any(Object),
      );
    });
  });

  it('does not render button when canOnlyViewHighlightSets is true', () => {
    useInProgressPathwaysData.mockImplementation(() => ([camelCaseObject(learnerPathwayData), null]));
    render(
      <PathwayProgressListingWithContext
        initialAppState={{ ...initialAppState, canOnlyViewHighlightSets: true }}
        initialUserSubsidyState={initialUserSubsidyState}
        canOnlyViewHighlightSets
      />,
    );
    expect(screen.queryByText('Explore pathways')).not.toBeInTheDocument();
  });
});
