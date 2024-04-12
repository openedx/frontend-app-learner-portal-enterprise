import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { useParams } from 'react-router-dom';
import EnrollmentCompletedSummaryCard from './components/EnrollmentCompletedSummaryCard';
import { renderWithRouterProvider } from '../../utils/tests';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(() => ({
    GETSMARTER_STUDENT_TC_URL: 'https://test.org/terms',
  })),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}
));

describe('EnrollmentCompletedSummaryCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useParams.mockReturnValue({ enterpriseSlug: 'test-enterprise-slug' });
  });

  it('renders the card with correct content', () => {
    renderWithRouterProvider(<IntlProvider locale="en"><EnrollmentCompletedSummaryCard /></IntlProvider>);

    // Check for the title
    expect(screen.getByText('What happens next?')).toBeInTheDocument();

    // Check for the email section
    expect(screen.getByText('Notified by email')).toBeInTheDocument();
    expect(screen.getByText('dashboard', { exact: false })).toHaveAttribute('href', '/test-enterprise-slug');

    // Check for the refund policy section
    expect(screen.getByText('Read the refund policy')).toBeInTheDocument();
    expect(screen.getByText('Terms and Conditions')).toHaveAttribute('href', 'https://test.org/terms');
  });
});
