import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Card, Col, Hyperlink, Row,
} from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import GetSmarterLogo from '../../../assets/icons/get-smarter-logo-black.svg';
import { features } from '../../../config';

const EnrollmentCompletedSummaryCard = ({
  isCourseAssigned,
  externalDashboardUrl,
  dashboardUrl,
  getStudentTCUrl,
}) => (
  <Card className="bg-light-500">
    <Row className="my-3">
      <Col xs={12} md={3}>
        <Card.Section>
          <img
            className="d-block"
            src={GetSmarterLogo}
            alt="partner-header-logo"
            data-testid="partner-header-logo-image-id"
          />
        </Card.Section>
      </Col>
      <Col xs={12} md={9}>
        <Card.Section>
          <div className="h3 mb-4">
            <FormattedMessage
              id="executive.education.external.course.enrollment.completed.page.summary.card.title"
              defaultMessage="What happens next?"
              description="Title for the executive education course enrollment completed page summary card"
            />
          </div>
          <div className="mb-3.5">
            <div className="mb-1.5 text-black-color">
              <FormattedMessage
                id="executive.education.external.course.enrollment.completed.page.summary.card.course.notified.about.email.section.heading"
                defaultMessage="Notified by email"
                description="Heading for the section about being notified by email to the learner"
              />
            </div>
            <div className="small mb-2 text-gray-500">
              {
                (features.FEATURE_ENABLE_TOP_DOWN_ASSIGNMENT && isCourseAssigned)
                  ? (
                    <FormattedMessage
                      id="executive.education.external.course.enrollment.completed.page.summary.card.email.section.content.dashboard.link"
                      defaultMessage="You will receive an email from edX when your course starts. Alternatively, you can visit your <a>edX dashboard</a> for course status updates."
                      description="Content for the section about being notified by email to the learner with a edx dashboard link. And here edX is brand name"
                      values={{
                        // eslint-disable-next-line react/no-unstable-nested-components
                        a: (chunks) => (
                          <Link to={dashboardUrl}>
                            {chunks}
                          </Link>
                        ),
                      }}
                    />
                  ) : (
                    <FormattedMessage
                      id="executive.education.external.course.enrollment.completed.page.summary.card.email.section.content.with.getsmarter.link"
                      defaultMessage="GetSmarter will email you when your course starts. Alternatively, you can visit your <a>GetSmarter learner dashboard</a> for course status updates."
                      description="Content for the section about being notified by email to the learner with a getsmarter dashboard link. And here Getsmarter is brand name"
                      values={{
                        // eslint-disable-next-line react/no-unstable-nested-components
                        a: (chunks) => (
                          <Hyperlink
                            destination={externalDashboardUrl}
                            target="_blank"
                          >
                            {chunks}
                          </Hyperlink>
                        ),
                      }}
                    />
                  )
              }
            </div>
          </div>
          <div className="mb-3.5">
            <div className="mb-1.5 text-black-color">
              <FormattedMessage
                id="executive.education.external.course.enrollment.completed.page.summary.card.course.refund.policy.section.heading"
                defaultMessage="Read the refund policy"
                description="Heading for the section about the refund policy for the executive education course"
              />
            </div>
            <div className="small text-gray-500">
              <FormattedMessage
                id="executive.education.external.course.enrollment.completed.page.summary.card.course.refund.policy.section.content"
                defaultMessage="As part of our commitment to your professional development, you may request to change
               your course start date or request your money back if you're not fully satisfied with 14 calendar days
                of your course start date."
                description="Content for the section about the refund policy for the executive education course"
              />
            </div>
            <div className="small mb-2 text-gray-500">
              <FormattedMessage
                id="executive.education.external.course.enrollment.completed.page.summary.card.course.refund.policy.section.read.content"
                defaultMessage="Read GetSmarter's <a>Terms and Conditions</a> for the full course postponement and cancellation policy."
                description="Content to read more about getsmarter refund policy for the executive education course. And here GetSmarter is brand name"
                values={{
                  // eslint-disable-next-line react/no-unstable-nested-components
                  a: (chunks) => (
                    <Hyperlink
                      destination={getStudentTCUrl}
                      target="_blank"
                    >
                      {chunks}
                    </Hyperlink>
                  ),
                }}
              />
            </div>
          </div>
        </Card.Section>
      </Col>
    </Row>
  </Card>
);

EnrollmentCompletedSummaryCard.propTypes = {
  isCourseAssigned: PropTypes.bool.isRequired,
  externalDashboardUrl: PropTypes.string.isRequired,
  dashboardUrl: PropTypes.string.isRequired,
  getStudentTCUrl: PropTypes.string.isRequired,
};

export default EnrollmentCompletedSummaryCard;
