import { AppContext } from '@edx/frontend-platform/react';
import { screen, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import ProgramEndorsements from '../ProgramEndorsements';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';
import { useEnterpriseCustomer, useProgramDetails } from '../../app/data';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useProgramDetails: jest.fn(),
}));

const mockAuthenticatedUser = authenticatedUserFactory();

const initialAppState = {
  authenticatedUser: mockAuthenticatedUser,
};

const ProgramEndorsementsWrapper = () => (
  <AppContext.Provider value={initialAppState}>
    <ProgramEndorsements />
  </AppContext.Provider>
);

const initialProgramState = {
  title: 'Test Program Title',
  corporateEndorsements: [
    {
      corporationName: 'company a',
      statement: 'i am company a',
      image: {
        src: 'https://example.com/company-a-logo',
        description: 'company a logo',
        height: 25,
        width: 25,
      },
      individualEndorsements: [
        {
          endorser: {
            givenName: 'muneeb',
            familyName: 'ur rehman',
            position: {
              title: 'economist',
            },
          },
          quote: 'good quote a',
        },
      ],
    },
    {
      corporationName: 'company b',
      statement: 'i am company b',
      image: {
        src: 'https://example.com/company-b-logo',
        description: 'company b logo',
        height: 25,
        width: 25,
      },
      individualEndorsements: [
        {
          endorser: {
            givenName: 'steve',
            familyName: 'jobs',
            position: {
              title: 'recruiter',
            },
          },
          quote: 'good quote b',
        },
      ],
    },
    {
      corporationName: 'company c',
      statement: 'i am company c',
      image: {
        src: 'https://example.com/company-c-logo',
        description: 'company c logo',
        height: 25,
        width: 25,
      },
      individualEndorsements: [
        {
          endorser: {
            givenName: 'donald',
            familyName: 'knuth',
            slug: 'donald-knuth',
            position: {
              title: 'mathematician',
            },
          },
          quote: 'good quote c',
        },
      ],
    },
  ],
};

const mockEnterpriseCustomer = enterpriseCustomerFactory();

describe('<ProgramEndorsements />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useProgramDetails.mockReturnValue({ data: initialProgramState });
  });

  test('renders program Endorsements', async () => {
    const { getByAltText } = await render(
      <ProgramEndorsementsWrapper />,
    );

    expect(screen.getByText('Program endorsements')).toBeInTheDocument();
    expect(screen.getByText('good quote a')).toBeInTheDocument();
    expect(screen.getByText('good quote b')).toBeInTheDocument();
    expect(screen.getByText('good quote c')).toBeInTheDocument();
    expect(screen.getByText('muneeb ur rehman , economist')).toBeInTheDocument();
    expect(screen.getByText('donald knuth , mathematician')).toBeInTheDocument();
    expect(screen.getByText('steve jobs , recruiter')).toBeInTheDocument();
    expect(getByAltText('company a').src).toContain('https://example.com/company-a-logo');
    expect(getByAltText('company b').src).toContain('https://example.com/company-b-logo');
    expect(getByAltText('company c').src).toContain('https://example.com/company-c-logo');
  });

  test('renders nothing when there are no endorsements in data', async () => {
    const programStateWithoutFaqs = {
      program: {
        title: 'Test Program Title',
      },
    };
    useProgramDetails.mockReturnValue({ data: programStateWithoutFaqs });
    const { container } = render(
      <ProgramEndorsementsWrapper />,
    );

    await waitFor(() => {
      expect(container.childElementCount).toEqual(0);
    });
  });
});
