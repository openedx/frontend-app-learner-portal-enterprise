import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import LearnerCreditSummaryCard from '../LearnerCreditSummaryCard';
import {
  LEARNER_CREDIT_ASSIGNMENT_ONLY_SUMMARY,
  LEARNER_CREDIT_CARD_SUMMARY,
  LEARNER_CREDIT_SUMMARY_CARD_TITLE,
} from '../data/constants';

const TEST_EXPIRATION_DATE = '2022-06-01T00:00:00Z';

describe('<LearnerCreditSummaryCard />', () => {
  it('should render searchCoursesCta', () => {
    render(
      <LearnerCreditSummaryCard
        expirationDate={TEST_EXPIRATION_DATE}
      />,
    );
    expect(screen.getByText(LEARNER_CREDIT_SUMMARY_CARD_TITLE)).toBeInTheDocument();
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

  it.each([{
    assignmentOnlyLearner: true,
    summaryText: LEARNER_CREDIT_ASSIGNMENT_ONLY_SUMMARY,
  }, {
    assignmentOnlyLearner: false,
    summaryText: LEARNER_CREDIT_CARD_SUMMARY,
  },
  ])('should render summary text based on assignmentOnlyLearner (%p)', ({ assignmentOnlyLearner, summaryText }) => {
    render(<LearnerCreditSummaryCard
      assignmentOnlyLearner={assignmentOnlyLearner}
      expirationDate={TEST_EXPIRATION_DATE}
    />);
    expect(screen.getByText(summaryText)).toBeInTheDocument();
  });
});
