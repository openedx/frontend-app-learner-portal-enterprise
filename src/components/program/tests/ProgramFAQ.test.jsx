import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import {
  screen, render, fireEvent, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { ProgramContextProvider } from '../ProgramContextProvider';
import ProgramFAQ from '../ProgramFAQ';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

/* eslint-disable react/prop-types */
const ProgramFAQWithContext = ({
  initialAppState = {},
  initialProgramState = {},
  initialUserSubsidyState = {},
}) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <ProgramContextProvider initialState={initialProgramState}>
        <ProgramFAQ />
      </ProgramContextProvider>
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

describe('<ProgramFAQ />', () => {
  const initialAppState = {
    enterpriseConfig: {
      slug: 'test-enterprise-slug',
    },
  };
  const initialProgramState = {
    program: {
      title: 'Test Program Title',
      faq: [
        {
          question: 'question a',
          answer: 'answer a',
        },
        {
          question: 'question b',
          answer: 'answer b',
        },
      ],
    },
  };
  const initialUserSubsidyState = {
    offers: {
      offers: [],
      offersCount: 0,
    },
  };

  test('renders program FAQs', () => {
    render(
      <ProgramFAQWithContext
        initialAppState={initialAppState}
        initialProgramState={initialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    const questionA = screen.getByText('question a');
    const questionB = screen.getByText('question b');
    expect(questionA).toBeInTheDocument();
    expect(questionB).toBeInTheDocument();
    fireEvent.click(questionA);
    expect(screen.getByText('answer a')).toBeInTheDocument();
    fireEvent.click(questionB);
    expect(screen.getByText('answer b')).toBeInTheDocument();
  });

  test('renders nothing when there are no FAQs in data', async () => {
    const programStateWithoutFaqs = {
      program: {
        title: 'Test Program Title',
      },
    };
    const { container } = render(
      <ProgramFAQWithContext
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
