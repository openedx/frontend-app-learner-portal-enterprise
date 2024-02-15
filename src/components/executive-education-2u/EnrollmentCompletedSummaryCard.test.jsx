import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import EnrollmentCompletedSummaryCard from './components/EnrollmentCompletedSummaryCard';

describe('EnrollmentCompletedSummaryCard', () => {
  const mockProps = {
    isCourseAssigned: true,
    externalDashboardUrl: 'https://test.org/external-dashboard',
    dashboardUrl: 'https://test.org/dashboard',
    getStudnetTCUrl: 'https://test.org/terms',
  };

  it('renders the card with correct content', () => {
    render(<IntlProvider locale="en"><EnrollmentCompletedSummaryCard {...mockProps} /></IntlProvider>);

    // Check for the title
    expect(screen.getByText('What happens next?')).toBeInTheDocument();

    // Check for the email section
    expect(screen.getByText('Notified by email')).toBeInTheDocument();

    // Check for the refund policy section
    expect(screen.getByText('Read the refund policy')).toBeInTheDocument();
  });

  it('renders the card with external dashboard link when course is not assigned', () => {
    const props = {
      ...mockProps,
      isCourseAssigned: false,
    };
    render(<IntlProvider locale="en"><EnrollmentCompletedSummaryCard {...props} /></IntlProvider>);

    // Check for the email section
    expect(screen.getByText('Notified by email')).toBeInTheDocument();
    expect(screen.getByText('GetSmarter learner dashboard')).toBeInTheDocument();
    expect(screen.queryByText('edx dashboard')).not.toBeInTheDocument();
    expect(screen.getByText('GetSmarter learner dashboard')).toHaveAttribute('href', 'https://test.org/external-dashboard');
  });
});
