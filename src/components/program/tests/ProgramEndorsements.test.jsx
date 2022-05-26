import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { ProgramContextProvider } from '../ProgramContextProvider';
import ProgramEndorsements from '../ProgramEndorsements';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

/* eslint-disable react/prop-types */
const ProgramEndorsementsWithContext = ({
  initialAppState = {},
  initialProgramState = {},
  initialUserSubsidyState = {},
}) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <ProgramContextProvider initialState={initialProgramState}>
        <ProgramEndorsements />
      </ProgramContextProvider>
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

describe('<ProgramEndorsements />', () => {
  const initialAppState = {
    enterpriseConfig: {
      slug: 'test-enterprise-slug',
    },
  };
  const initialProgramState = {
    program: {
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

  test('renders program Endorsements', async () => {
    const { getByAltText } = await render(
      <ProgramEndorsementsWithContext
        initialAppState={initialAppState}
        initialProgramState={initialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
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
    const { container } = render(
      <ProgramEndorsementsWithContext
        initialAppState={initialAppState}
        initialProgramState={programStateWithoutFaqs}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    await waitFor(() => {
      expect(container.childElementCount).toEqual(0);
    });
  });
});
