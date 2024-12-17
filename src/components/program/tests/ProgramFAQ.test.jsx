import { AppContext } from '@edx/frontend-platform/react';
import {
  screen, render, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import userEvent from '@testing-library/user-event';
import ProgramFAQ from '../ProgramFAQ';
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

const ProgramFAQWithContext = () => (
  <AppContext.Provider value={initialAppState}>
    <ProgramFAQ />
  </AppContext.Provider>
);

const initialProgramState = {
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
};

const mockEnterpriseCustomer = enterpriseCustomerFactory();

describe('<ProgramFAQ />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useProgramDetails.mockReturnValue({ data: initialProgramState });
  });
  test('renders program FAQs', () => {
    render(
      <ProgramFAQWithContext />,
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
      title: 'Test Program Title',
    };
    useProgramDetails.mockReturnValue({ data: programStateWithoutFaqs });

    const { container } = render(
      <ProgramFAQWithContext />,
    );

    await waitFor(() => {
      expect(container.childElementCount).toEqual(0);
    });
  });
});
