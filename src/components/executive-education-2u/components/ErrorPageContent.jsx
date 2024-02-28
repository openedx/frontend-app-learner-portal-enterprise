import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button, Col, Row } from '@openedx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import { sendEnterpriseTrackEventWithDelay } from '@edx/frontend-enterprise-utils';
import { ArrowBack } from '@openedx/paragon/icons';

import { ErrorPage } from '../../error-page';
import ExecutiveEducation2UErrorIllustration from
  '../../../assets/images/executive-education-2u/error-illustration.svg';
import ContactAdminMailto from '../../contact-admin-mailto';

export const showHelpfulLink = (failureCode) => {
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

const ErrorPageContent = ({
  className,
  failureReason,
  failureMessage,
  httpReferrer,
}) => {
  const { enterpriseConfig: { uuid: enterpriseId } } = useContext(AppContext);

  const shouldShowHelpfulLink = showHelpfulLink(failureReason);

  return (
    <ErrorPage.Content className={classNames('text-center', className)}>
      <Row>
        <Col xs={12} lg={{ span: 10, offset: 1 }}>
          <img
            src={ExecutiveEducation2UErrorIllustration}
            className="mb-4"
            alt=""
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
            {failureMessage}
          </p>
          {httpReferrer && !shouldShowHelpfulLink && (
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
          {shouldShowHelpfulLink && (
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

ErrorPageContent.propTypes = {
  failureReason: PropTypes.string.isRequired,
  failureMessage: PropTypes.string.isRequired,
  httpReferrer: PropTypes.string,
  className: PropTypes.string,
};

ErrorPageContent.defaultProps = {
  httpReferrer: undefined,
  className: undefined,
};

export default ErrorPageContent;
