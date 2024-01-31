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

const TEST_EXPIRATION_DATE = '2022-06-01T00:00:00Z';

describe('<LearnerCreditSummaryCard />', () => {
  it('should render searchCoursesCta', () => {
    render(
      <IntlProvider locale="en">
        <LearnerCreditSummaryCard
          expirationDate={TEST_EXPIRATION_DATE}
        />
      </IntlProvider>,
    );
    expect(screen.getByText(LEARNER_CREDIT_SUMMARY_CARD_TITLE)).toBeInTheDocument();
  });

  it('should render the expiration date passed as prop', () => {
    render(
      <IntlProvider locale="en">
        <LearnerCreditSummaryCard
          expirationDate={TEST_EXPIRATION_DATE}
        />
      </IntlProvider>,
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
      <IntlProvider locale="en">
        <LearnerCreditSummaryCard
          assignmentOnlyLearner={assignmentOnlyLearner}
          expirationDate={TEST_EXPIRATION_DATE}
        />
      </IntlProvider>,
    );
    expect(screen.getByText(summaryText)).toBeInTheDocument();
  });
});
