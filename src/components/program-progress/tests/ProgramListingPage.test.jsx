import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import {
  screen, act,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import userEvent from '@testing-library/user-event';
import { Link } from 'react-router-dom';
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

jest.mock('@edx/frontend-platform/react', () => ({
  ...jest.requireActual('@edx/frontend-platform/react'),
  ErrorPage: () => <div data-testid="error-page" />,
}));

jest.mock('../data/hooks', () => ({
  useLearnerProgramsListData: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: jest.fn().mockImplementation(({ to, children }) => (
    <a href={to}>{children}</a>
  )),
}));

const ProgramListingWithContext = ({
  initialAppState = {},
  initialUserSubsidyState = {},
  canOnlyViewHighlightSets = false,
  programsListData = [],
  programsFetchError = null,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <UserSubsidyContext.Provider value={initialUserSubsidyState}>
        <ProgramListingPage
          canOnlyViewHighlightSets={canOnlyViewHighlightSets}
          programsListData={programsListData}
          programsFetchError={programsFetchError}
        />
      </UserSubsidyContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);

describe('<ProgramListing />', () => {
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
      renderWithRouter(
        <ProgramListingWithContext
          initialAppState={initialAppState}
          initialUserSubsidyState={initialUserSubsidyState}
          programsListData={[dummyProgramData, dataForAnotherProgram]}
        />,
      );
      expect(screen.getByText(dummyProgramData.title)).toBeInTheDocument();
      expect(screen.getByText('Test Program Title 2')).toBeInTheDocument();
    });
  });

  it('renders program error.', async () => {
    useLearnerProgramsListData.mockImplementation(() => ([{}, { message: 'This is a test message.' }]));
    renderWithRouter(
      <ProgramListingWithContext
        initialAppState={initialAppState}
        initialUserSubsidyState={initialUserSubsidyState}
        programsFetchError={{ message: 'This is a test message.' }}
      />,
    );
    expect(screen.getByTestId('error-page')).toBeInTheDocument();
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
      renderWithRouter(
        <ProgramListingWithContext
          initialAppState={initialAppState}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );
      userEvent.click(screen.getByText('Explore programs'));
      expect(Link).toHaveBeenCalledWith(
        expect.objectContaining({
          to: `/${initialAppState.enterpriseConfig.slug}/search?content_type=${CONTENT_TYPE_PROGRAM}`,
        }),
        expect.any(Object),
      );
    });
  });

  it('does not render button when canOnlyViewHighlightSets is true', () => {
    useLearnerProgramsListData.mockImplementation(() => ([[], null]));

    renderWithRouter(
      <ProgramListingWithContext
        initialAppState={initialAppState}
        initialUserSubsidyState={initialUserSubsidyState}
        canOnlyViewHighlightSets
      />,
    );
    expect(screen.queryByText('Explore programs')).not.toBeInTheDocument();
  });
});
