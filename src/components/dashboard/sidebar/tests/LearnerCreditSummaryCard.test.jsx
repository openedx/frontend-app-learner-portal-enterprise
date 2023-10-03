import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen, render } from '@testing-library/react';
import LearnerCreditSummaryCard from '../LearnerCreditSummaryCard';
import { LEARNER_CREDIT_SUMMARY_CARD_TITLE } from '../data/constants';

const TEST_EXPIRATION_DATE = '2022-06-01T00:00:00Z';

describe('<LearnerCreditSummaryCard />', () => {
  it('should render searchCoursesCta', () => {
    const cta = 'Search Courses';
    render(
      <LearnerCreditSummaryCard
        expirationDate={TEST_EXPIRATION_DATE}
        searchCoursesCta={
          <button type="button">{cta}</button>
        }
      />,
    );
    expect(screen.getByText(LEARNER_CREDIT_SUMMARY_CARD_TITLE)).toBeInTheDocument();
    expect(screen.getByText(cta)).toBeInTheDocument();
  });

  it('should render default summary text', () => {
    render(
      <LearnerCreditSummaryCard
        expirationDate={TEST_EXPIRATION_DATE}
      />,
    );
    expect(screen.getByTestId('learner-credit-summary-text')).toBeInTheDocument();
  });

  it('should render the expiration date passed as prop', () => {
    render(
      <LearnerCreditSummaryCard
        expirationDate={TEST_EXPIRATION_DATE}
      />,
    );
    expect(screen.getByTestId('learner-credit-summary-end-date-text')).toBeInTheDocument();
    expect(screen.getByText('2022', { exact: false })).toBeInTheDocument();
  });
});
