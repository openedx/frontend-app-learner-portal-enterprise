import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import {
  screen, render, act, fireEvent,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from 'react-intl';
import { initializeMockApp } from '@edx/frontend-platform';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import ProgramListingPage from '../ProgramListingPage';
import { useLearnerProgramsListData } from '../data/hooks';
import { NO_PROGRAMS_ERROR_MESSAGE } from '../data/constants';
import { renderWithRouter } from '../../../utils/tests';
import { CONTENT_TYPE_PROGRAM } from '../../search/constants';

const dummyProgramData = {
  uuid: 'test-uuid',
  title: 'Test Program Title',
  type: 'MicroMasters',
  bannerImage: {
    large: {
      url: 'www.example.com/large',
      height: 123,
      width: 455,
    },
    medium: {
      url: 'www.example.com/medium',
      height: 123,
      width: 455,
    },
    small: {
      url: 'www.example.com/small',
      height: 123,
      width: 455,
    },
    xSmall: {
      url: 'www.example.com/xSmall',
      height: 123,
      width: 455,
    },
  },
  authoringOrganizations: [
    {
      key: 'test-key',
      logoImageUrl: '/media/organization/logos/shield.png',
    },
  ],
  progress: {
    inProgress: 1,
    completed: 2,
    notStarted: 3,
  },

};

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: () => ({ username: 'b.wayne' }),
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('../data/hooks', () => ({
  useLearnerProgramsListData: jest.fn(),
}));

/* eslint-disable react/prop-types */
const ProgramListingWithContext = ({
  initialAppState = {},
  initialUserSubsidyState = {},
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <UserSubsidyContext.Provider value={initialUserSubsidyState}>
        <ProgramListingPage />
      </UserSubsidyContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);

describe('<ProgramListing />', () => {
  beforeEach(() => {
    initializeMockApp();
  });

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

  it('renders all program cards', async () => {
    const dataForAnotherProgram = { ...dummyProgramData };
    dataForAnotherProgram.title = 'Test Program Title 2';
    useLearnerProgramsListData.mockImplementation(() => ([[dummyProgramData, dataForAnotherProgram], null]));

    await act(async () => {
      render(
        <ProgramListingWithContext
          initialAppState={initialAppState}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );
      expect(screen.getByText(dummyProgramData.title)).toBeInTheDocument();
      expect(screen.getByText('Test Program Title 2')).toBeInTheDocument();
    });
  });

  it('renders program error.', async () => {
    useLearnerProgramsListData.mockImplementation(() => ([{}, { message: 'This is a test message.' }]));

    await act(async () => {
      render(
        <ProgramListingWithContext
          initialAppState={initialAppState}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );

      expect(screen.getByText('This is a test message.')).toBeInTheDocument();
      expect(screen.getByText('Try again')).toBeInTheDocument();
    });
  });

  it('renders no programs message when data received is empty', async () => {
    useLearnerProgramsListData.mockImplementation(() => ([[], null]));

    await act(async () => {
      renderWithRouter(
        <ProgramListingWithContext
          initialAppState={initialAppState}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );
      expect(screen.getByText(NO_PROGRAMS_ERROR_MESSAGE)).toBeInTheDocument();
      expect(screen.getByText('Explore programs')).toBeInTheDocument();
    });
  });

  it('redirects to correct url when clicked on explore programs', async () => {
    useLearnerProgramsListData.mockImplementation(() => ([[], null]));

    await act(async () => {
      const { history } = renderWithRouter(
        <ProgramListingWithContext
          initialAppState={initialAppState}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );
      fireEvent.click(screen.getByText('Explore programs'));
      expect(history.location.pathname).toEqual(`/${initialAppState.enterpriseConfig.slug}/search`);
      expect(history.location.search).toEqual(`?content_type=${CONTENT_TYPE_PROGRAM}`);
    });
  });
});
