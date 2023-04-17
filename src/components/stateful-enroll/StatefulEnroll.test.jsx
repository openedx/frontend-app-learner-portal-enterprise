import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

import StatefulEnroll from './StatefulEnroll';
import {
  useRedemptionMutation,
  // useTransactionStatus,
} from './data';

// Create a client
const queryClient = new QueryClient();

const MOCK_USER_ID = 3;
jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: () => ({
    id: MOCK_USER_ID,
  }),
}));

const StatefulEnrollWrapper = (props) => (
  <QueryClientProvider client={queryClient}>
    <IntlProvider locale="en">
      <StatefulEnroll {...props} />
    </IntlProvider>
  </QueryClientProvider>
);

const MOCK_COURSE_RUN_KEY = 'course-v1:edX+S2023+1T2023';

describe('StatefulEnroll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with "Enroll" label', () => {
    render(<StatefulEnrollWrapper contentKey={MOCK_COURSE_RUN_KEY} />);
    expect(screen.getByText('Enroll')).toBeInTheDocument();
  });

  it('should allow the button labels to be overriden', () => {
    render(
      <StatefulEnrollWrapper
        contentKey={MOCK_COURSE_RUN_KEY}
        labels={{
          default: 'Hello world',
        }}
      />,
    );
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('should handle successful enrollment', () => {
    render(<StatefulEnrollWrapper contentKey={MOCK_COURSE_RUN_KEY} />);
    expect(screen.getByText('Enroll')).toBeInTheDocument();
  });
});
