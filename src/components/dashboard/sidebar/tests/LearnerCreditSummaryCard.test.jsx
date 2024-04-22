import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import LearnerCreditSummaryCard from '../LearnerCreditSummaryCard';
import {
  LEARNER_CREDIT_ASSIGNMENT_ONLY_SUMMARY,
  LEARNER_CREDIT_CARD_SUMMARY,
  LEARNER_CREDIT_SUMMARY_CARD_TITLE,
} from '../data/constants';
import { BUDGET_STATUSES } from '../../data';

const TEST_EXPIRATION_DATE = '2022-06-01T00:00:00Z';

const mockActiveStatusMetadata = {
  status: BUDGET_STATUSES.active,
  badgeVariant: 'success',
  term: 'Expires',
  date: TEST_EXPIRATION_DATE,
};

const LearnerCreditSummaryCardWrapper = (props) => (
  <IntlProvider locale="en">
    <LearnerCreditSummaryCard {...props} />
  </IntlProvider>
);

describe('<LearnerCreditSummaryCard />', () => {
  it('should render searchCoursesCta', () => {
    render(
      <LearnerCreditSummaryCardWrapper
        expirationDate={TEST_EXPIRATION_DATE}
        statusMetadata={mockActiveStatusMetadata}
        assignmentOnlyLearner
      />,
    );
    expect(screen.getByText(LEARNER_CREDIT_SUMMARY_CARD_TITLE)).toBeInTheDocument();
  });

  it('should render the expiration date passed as prop', () => {
    render(
      <LearnerCreditSummaryCardWrapper
        expirationDate={TEST_EXPIRATION_DATE}
        statusMetadata={mockActiveStatusMetadata}
        assignmentOnlyLearner
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
    render(
      <LearnerCreditSummaryCardWrapper
        expirationDate={TEST_EXPIRATION_DATE}
        statusMetadata={mockActiveStatusMetadata}
        assignmentOnlyLearner={assignmentOnlyLearner}
      />,
    );
    expect(screen.getByText(summaryText)).toBeInTheDocument();
  });
});
