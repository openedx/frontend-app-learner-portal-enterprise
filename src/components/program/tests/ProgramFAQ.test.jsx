import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import {
  screen, render, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import userEvent from '@testing-library/user-event';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { ProgramContextProvider } from '../ProgramContextProvider';
import ProgramFAQ from '../ProgramFAQ';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

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
    subscriptionLicense: {
      uuid: 'test-license-uuid',
    },
    couponCodes: {
      couponCodes: [],
      couponCodesCount: 0,
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
    userEvent.click(questionA);
    expect(screen.getByText('answer a')).toBeInTheDocument();
    userEvent.click(questionB);
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
