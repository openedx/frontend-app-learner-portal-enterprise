import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import userEvent from '@testing-library/user-event';
import ProgramListingPage from '../ProgramListingPage';
import { renderWithRouter } from '../../../utils/tests';
import { useCanOnlyViewHighlights, useEnterpriseCustomer, useEnterpriseProgramsList } from '../../app/data';
import { enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';
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

jest.mock('@edx/frontend-platform/react', () => ({
  ...jest.requireActual('@edx/frontend-platform/react'),
  ErrorPage: () => <div data-testid="error-page" />,
}));

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useCanOnlyViewHighlights: jest.fn(),
  useEnterpriseCustomer: jest.fn(),
  useEnterpriseProgramsList: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();

const ProgramListingWithContext = () => (
  <IntlProvider locale="en">
    <ProgramListingPage />
  </IntlProvider>
);

describe('<ProgramListing />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCanOnlyViewHighlights.mockReturnValue({ data: false });
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useEnterpriseProgramsList.mockReturnValue({ data: [], error: null });
  });

  it('renders all program cards', async () => {
    const dataForAnotherProgram = { ...dummyProgramData };
    dataForAnotherProgram.title = 'Test Program Title 2';
    useEnterpriseProgramsList.mockReturnValue({ data: [dummyProgramData, dataForAnotherProgram] });

    renderWithRouter(
      <ProgramListingWithContext />,
    );
    await waitFor(() => {
      expect(screen.getByText(dummyProgramData.title)).toBeInTheDocument();
      expect(screen.getByText('Test Program Title 2')).toBeInTheDocument();
    });
  });

  it('renders program error.', async () => {
    useEnterpriseProgramsList.mockReturnValue({
      data: [],
      error: { message: 'This is a test message.' },
    });
    renderWithRouter(
      <ProgramListingWithContext />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('error-page')).toBeInTheDocument();
    });
  });

  it('renders no programs message when data received is empty', async () => {
    renderWithRouter(
      <ProgramListingWithContext />,
    );
    await waitFor(() => {
      expect(screen.getByText('You are not enrolled in any programs yet.')).toBeInTheDocument();
      expect(screen.getByText('Explore programs')).toBeInTheDocument();
    });
  });

  it('redirects to correct url when clicked on explore programs', async () => {
    renderWithRouter(
      <ProgramListingWithContext />,
    );
    await waitFor(() => {
      expect(screen.getByText('Explore programs')).toBeInTheDocument();
    });
    userEvent.click(screen.getByText('Explore programs'));
    expect(window.location.pathname).toEqual(`/${mockEnterpriseCustomer.slug}/search`);
    expect(window.location.search).toEqual(`?content_type=${CONTENT_TYPE_PROGRAM}`);
  });

  it('does not render button when canOnlyViewHighlightSets is true', () => {
    useCanOnlyViewHighlights.mockReturnValue({ data: true });
    renderWithRouter(
      <ProgramListingWithContext />,
    );
    expect(screen.queryByText('Explore programs')).not.toBeInTheDocument();
  });
});
