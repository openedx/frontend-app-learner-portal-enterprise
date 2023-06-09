import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';

import ErrorPageContent from './components/ErrorPageContent';

const messages = defineMessages({
  noOfferAvailable: {
    id: 'ExecutiveEducation2UError.noOfferAvailable',
    defaultMessage: 'No learner credit is available to cover this course.',
    description: 'Error message when no learner credit is available to cover this course.',
  },
  noOfferWithEnoughBalance: {
    id: 'ExecutiveEducation2UError.noOfferWithEnoughBalance',
    defaultMessage: 'You don\'t have access to this course because your organization '
                    + 'doesn\'t have enough funds. Please contact your edX administrator '
                    + 'to resolve the error and provide you access to this content.',
    description: 'Error message when no learner credit is available to cover this course.',
  },
  noOfferWithEnoughUserBalance: {
    id: 'ExecutiveEducation2UError.noOfferWithEnoughUserBalance',
    defaultMessage: 'Your enrollment was not completed! You have already spent your personal budget for enrollments.',
    description: 'Error message when no learner credit is available to cover this course.',
  },
  noOfferWithRemainingApplications: {
    id: 'ExecutiveEducation2UError.noOfferWithRemainingApplications',
    defaultMessage: 'Your enrollment was not completed! You have reached your maximum number of allowed enrollments.',
    description: 'Error message when no learner credit is available to cover this course.',
  },
  systemError: {
    id: 'ExecutiveEducation2UError.systemError',
    defaultMessage: 'System Error has occurred.',
    description: 'Error message when no learner credit is available to cover this course.',
  },
  default: {
    id: 'ExecutiveEducation2UError.default',
    defaultMessage: 'An error has occurred.',
    description: 'Error message when no learner credit is available to cover this course.',
  },
});

export const createExecutiveEducationFailureMessage = ({ failureCode, intl }) => {
  const failureCodeMessages = {
    no_offer_available: intl.formatMessage(messages.noOfferAvailable),
    no_offer_with_enough_balance: intl.formatMessage(messages.noOfferWithEnoughBalance),
    no_offer_with_enough_user_balance: intl.formatMessage(messages.noOfferWithEnoughUserBalance),
    no_offer_with_remaining_applications: intl.formatMessage(messages.noOfferWithRemainingApplications),
    system_error: intl.formatMessage(messages.systemError),
    default: intl.formatMessage(messages.default),
  };
  return failureCodeMessages[failureCode] ?? failureCodeMessages.default;
};

const ExecutiveEducation2UError = ({ failureReason, httpReferrer }) => {
  const intl = useIntl();
  const failureMessage = createExecutiveEducationFailureMessage({ failureCode: failureReason, intl });
  return (
    <ErrorPageContent
      failureReason={failureReason}
      failureMessage={failureMessage}
      httpReferrer={httpReferrer}
    />
  );
};

ExecutiveEducation2UError.propTypes = {
  failureReason: PropTypes.string,
  httpReferrer: PropTypes.string,
};

ExecutiveEducation2UError.defaultProps = {
  failureReason: null,
  httpReferrer: null,
};

export default ExecutiveEducation2UError;
