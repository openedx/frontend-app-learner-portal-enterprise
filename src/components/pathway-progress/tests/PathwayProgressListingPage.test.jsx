import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import {
  screen, render, act, fireEvent,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { camelCaseObject } from '@edx/frontend-platform/utils';
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

jest.mock('../data/hooks', () => ({
  useInProgressPathwaysData: jest.fn(),
}));

/* eslint-disable react/prop-types */
const PathwayProgressListingWithContext = ({
  initialAppState = {},
  initialUserSubsidyState = {},
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <UserSubsidyContext.Provider value={initialUserSubsidyState}>
        <PathwayProgressListingPage />
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
        <PathwayProgressListingWithContext
          initialAppState={initialAppState}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );
      expect(screen.getByText('test 1')).toBeInTheDocument();
      expect(screen.getByText('test 2')).toBeInTheDocument();
      expect(screen.getByText('test 3')).toBeInTheDocument();
    });
  });

  it('renders pathway error.', async () => {
    useInProgressPathwaysData.mockImplementation(() => ([{}, { message: 'This is a test message.' }]));

    await act(async () => {
      render(
        <PathwayProgressListingWithContext
          initialAppState={initialAppState}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );

      expect(screen.getByText('This is a test message.')).toBeInTheDocument();
      expect(screen.getByText('Try again')).toBeInTheDocument();
    });
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
      const { history } = renderWithRouter(
        <PathwayProgressListingWithContext
          initialAppState={initialAppState}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );
      fireEvent.click(screen.getByText('Explore pathways'));
      expect(history.location.pathname).toEqual(`/${initialAppState.enterpriseConfig.slug}/search`);
      expect(history.location.search).toEqual(`?content_type=${CONTENT_TYPE_PATHWAY}`);
    });
  });
});
