import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import dayjs from 'dayjs';
import LearnerCreditSummaryCard from '../LearnerCreditSummaryCard';
import {
  LEARNER_CREDIT_ASSIGNMENT_ONLY_SUMMARY,
  LEARNER_CREDIT_CARD_SUMMARY,
  LEARNER_CREDIT_SUMMARY_CARD_TITLE,
} from '../data/constants';
import { BUDGET_STATUSES } from '../../data';
import { useEnterpriseCustomer } from '../../../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../../app/data/services/data/__factories__';

const TEST_UPCOMING_EXPIRATION_DATE = dayjs().add(10, 'days').toISOString();
const TEST_UPCOMING_EXPIRATION_DATE_TEXT = dayjs().add(10, 'days').format('MMM D, YYYY');
const TEST_EXPIRED_DATE = dayjs().subtract(10, 'days').toISOString();
const TEST_EXPIRED_DATE_TEXT = dayjs().subtract(10, 'days').format('MMM D, YYYY');
const mockActiveStatusMetadata = {
  status: BUDGET_STATUSES.active,
  badgeVariant: 'success',
  term: 'Expires',
  date: TEST_UPCOMING_EXPIRATION_DATE,
};
jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();

const LearnerCreditSummaryCardWrapper = (props) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
      <LearnerCreditSummaryCard {...props} />
    </AppContext.Provider>
  </IntlProvider>
);

describe('<LearnerCreditSummaryCard />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });
  it('should render searchCoursesCta', () => {
    render(
      <LearnerCreditSummaryCardWrapper
        expirationDate={TEST_UPCOMING_EXPIRATION_DATE}
        statusMetadata={mockActiveStatusMetadata}
        assignmentOnlyLearner
      />,
    );
    expect(screen.getByText(LEARNER_CREDIT_SUMMARY_CARD_TITLE)).toBeInTheDocument();
  });

  it('should render the expiration date passed as prop', () => {
    render(
      <LearnerCreditSummaryCardWrapper
        expirationDate={TEST_UPCOMING_EXPIRATION_DATE}
        statusMetadata={mockActiveStatusMetadata}
        assignmentOnlyLearner
      />,
    );
    expect(screen.getByTestId('learner-credit-summary-end-date-text')).toBeInTheDocument();
    expect(screen.getByText(TEST_UPCOMING_EXPIRATION_DATE_TEXT, { exact: false })).toBeInTheDocument();
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
        expirationDate={TEST_UPCOMING_EXPIRATION_DATE}
        statusMetadata={mockActiveStatusMetadata}
        assignmentOnlyLearner={assignmentOnlyLearner}
      />,
    );
    expect(screen.getByText(summaryText)).toBeInTheDocument();
  });

  it.each([{
    activeStatusMetadata: {
      status: BUDGET_STATUSES.expiring,
      badgeVariant: 'warning',
    },
    expiration: {
      date: TEST_UPCOMING_EXPIRATION_DATE,
      text: TEST_UPCOMING_EXPIRATION_DATE_TEXT,
    },
    disableExpiryMessagingForLearnerCredit: false,
  },
  {
    activeStatusMetadata: {
      status: BUDGET_STATUSES.expiring,
      badgeVariant: 'warning',
    },
    expiration: {
      date: TEST_UPCOMING_EXPIRATION_DATE,
      text: TEST_UPCOMING_EXPIRATION_DATE_TEXT,
    },
    disableExpiryMessagingForLearnerCredit: true,
  },
  {
    activeStatusMetadata: {
      status: BUDGET_STATUSES.expired,
      badgeVariant: 'danger',
    },
    expiration: {
      date: TEST_EXPIRED_DATE,
      text: TEST_EXPIRED_DATE_TEXT,
    },
    disableExpiryMessagingForLearnerCredit: false,
  },
  {
    activeStatusMetadata: {
      status: BUDGET_STATUSES.expired,
      badgeVariant: 'danger',
    },
    expiration: {
      date: TEST_EXPIRED_DATE,
      text: TEST_EXPIRED_DATE_TEXT,
    },
    disableExpiryMessagingForLearnerCredit: true,
  }])('should not display "Expiring" badge if disableExpiryMessagingForLearnerCredit is true (%s)', ({
    activeStatusMetadata,
    expiration,
    disableExpiryMessagingForLearnerCredit,
  }) => {
    useEnterpriseCustomer.mockReturnValue({
      data: {
        ...mockEnterpriseCustomer,
        disableExpiryMessagingForLearnerCredit,
      },
    });
    render(
      <LearnerCreditSummaryCardWrapper
        expirationDate={expiration.date}
        statusMetadata={activeStatusMetadata}
        assignmentOnlyLearner
      />,
    );
    const { status } = activeStatusMetadata;
    if (disableExpiryMessagingForLearnerCredit && (
      status === BUDGET_STATUSES.expiring || status === BUDGET_STATUSES.expired
    )) {
      expect(screen.queryByText(status)).not.toBeInTheDocument();
      expect(screen.queryByText(expiration.text, { exact: false })).not.toBeInTheDocument();
      expect(screen.queryByTestId('learner-credit-summary-end-date-text')).not.toBeInTheDocument();
      if (activeStatusMetadata.status === BUDGET_STATUSES.expiring) {
        expect(screen.getByText(BUDGET_STATUSES.active)).toBeInTheDocument();
      }
    } else {
      expect(screen.queryByText(status)).toBeInTheDocument();
      expect(screen.queryByText(expiration.text, { exact: false })).toBeInTheDocument();
      expect(screen.queryByTestId('learner-credit-summary-end-date-text')).toBeInTheDocument();
    }
  });
});
