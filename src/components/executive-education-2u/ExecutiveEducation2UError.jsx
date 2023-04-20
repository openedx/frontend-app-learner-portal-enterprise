import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { ArrowBack } from '@edx/paragon/icons';
import { Button, Col, Row } from '@edx/paragon';
import { sendEnterpriseTrackEventWithDelay } from '@edx/frontend-enterprise-utils';

import ContactAdminMailto from '../contact-admin-mailto';
import {
  ErrorPage,
} from '../error-page';
import ExecutiveEducation2UErrorIllustration from
  '../../assets/images/executive-education-2u/error-illustration.svg';

const ExecutiveEducation2UError = ({ failureReason, httpReferrer }) => {
  const { enterpriseConfig: { uuid: enterpriseId } } = useContext(AppContext);

  const createExecutiveEducationFailureMessage = (failureCode) => {
    const failureCodeMessages = {
      no_offer_available: 'No offer is available to cover this course.',
      no_offer_with_enough_balance: 'You don’t have access to this course because your organization '
                                      + 'doesn’t have enough funds. Please contact your edX administrator '
                                      + 'to resolve the error and provide you access to this content.',
      no_offer_with_enough_user_balance: 'Your enrollment was not completed! You have already spent your personal budget for enrollments.',
      no_offer_with_remaining_applications: 'Your enrollment was not completed! You have reached your maximum number of allowed enrollments.',
      system_error: 'System Error has occurred.',
      default: 'An error has occurred.',
    };
    return failureCodeMessages[failureCode] ? failureCodeMessages[failureCode] : failureCodeMessages.default;
  };
  const showHelpfulLink = (failureCode) => {
    const failureCodeShowLink = {
      no_offer_available: true,
      no_offer_with_enough_balance: true,
      no_offer_with_enough_user_balance: true,
      no_offer_with_remaining_applications: true,
      system_error: false,
      default: false,
    };
    return failureCodeShowLink[failureCode] ? failureCodeShowLink[failureCode] : failureCodeShowLink.default;
  };
  return (
    <ErrorPage.Content className="mt-5 text-center">
      <Row>
        <Col xs={12} lg={{ span: 10, offset: 1 }}>
          <img
            src={ExecutiveEducation2UErrorIllustration}
            className="mb-4"
            alt="Executive Education 2U Error Illustration"
          />
          <div className="executive-education-2u-error-heading mb-4">
            <span className="executive-education-2u-error-heading-red mr-2">
              We&apos;re sorry.
            </span>
            <span className="executive-education-2u-error-heading-black">
              Something went wrong.
            </span>
          </div>
          <p
            className="executive-education-2u-error-heading-details mb-4"
            data-testid="executive-education-2u-error-heading-details"
          >
            {createExecutiveEducationFailureMessage(failureReason)}
          </p>
          {httpReferrer && !showHelpfulLink(failureReason) && (
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
              Return to dashboard
            </Button>
          )}
          {showHelpfulLink(failureReason) && (
            <div>
              <span className="executive-education-2u-error-link-description pr-2">
                Helpful link:
              </span>
              <span className="executive-education-2u-error-link-box">
                <ContactAdminMailto />
              </span>
            </div>
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
