import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { ArrowBack } from '@edx/paragon/icons';
import { Button, Col, Row } from '@edx/paragon';
import { sendEnterpriseTrackEventWithDelay } from '@edx/frontend-enterprise-utils';

import {
  ErrorPage,
} from '../error-page';

const ExecutiveEducation2UError = ({ failureReason, httpReferrer }) => {
  const { enterpriseConfig: { uuid: enterpriseId } } = useContext(AppContext);

  const createExecutiveEducationFailureMessage = (failureCode) => {
    const failureCodeMessages = {
      no_offer_available: 'No offer is available to cover this course.',
      no_offer_with_enough_balance: 'Your organization doesn’t have sufficient balance to cover this course.',
      no_offer_with_enough_user_balance: 'You don’t have sufficient balance to cover this course.',
      system_error: 'System Error has occured.',
      default: 'An error has occured.',
    };
    return failureCodeMessages[failureCode] ? failureCodeMessages[failureCode] : failureCodeMessages.default;
  };
  return (
    <ErrorPage.Content className="mt-5 text-center">
      <Row>
        <Col xs={12} lg={{ span: 10, offset: 1 }}>
          <ErrorPage.Title />
          <ErrorPage.Subtitle>
            {createExecutiveEducationFailureMessage(failureReason)}
          </ErrorPage.Subtitle>
          <p className="mb-6">
            Please contact your edX administrator to resolve the error and gain access to this content.
          </p>
          {httpReferrer && (
            <Button
              href={httpReferrer}
              iconBefore={ArrowBack}
              variant="primary"
              onClick={async (e) => {
                e.preventDefault();
                await sendEnterpriseTrackEventWithDelay(
                  enterpriseId,
                  'edx.ui.enterprise.learner_portal.executive_education.return_to_lms.clicked',
                );
                global.location.href = httpReferrer;
              }}
            >
              Return to your learning platform
            </Button>
          )}
        </Col>
      </Row>
    </ErrorPage.Content>
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
