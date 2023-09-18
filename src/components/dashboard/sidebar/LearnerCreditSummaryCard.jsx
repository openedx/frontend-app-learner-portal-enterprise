import React from 'react';
import PropTypes from 'prop-types';
import { Badge, Row, Col } from '@edx/paragon';
import dayjs from 'dayjs';
import {
  LEARNER_CREDIT_SUMMARY_CARD_TITLE,
  LEARNER_CREDIT_ACTIVE_BADGE_LABEL,
  LEARNER_CREDIT_ACTIVE_BADGE_VARIANT,
  LEARNER_CREDIT_CARD_SUMMARY,
} from './data/constants';
import SidebarCard from './SidebarCard';

const LearnerCreditSummaryCard = ({
  className, expirationDate, searchCoursesCta,
}) => (
  <SidebarCard
    title={
      (
        <div className="d-flex align-items-center justify-content-between">
          <h3 className="m-0">{LEARNER_CREDIT_SUMMARY_CARD_TITLE}</h3>
          <Badge
            variant={LEARNER_CREDIT_ACTIVE_BADGE_VARIANT}
            className="ml-2"
            data-testid="learner-credit-status-badge"
          >
            {LEARNER_CREDIT_ACTIVE_BADGE_LABEL}
          </Badge>
        </div>
      )
    }
    cardClassNames={className}
  >
    <p data-testid="learner-credit-summary-text">
      { LEARNER_CREDIT_CARD_SUMMARY }
    </p>

    {expirationDate && (
      <p data-testid="learner-credit-summary-end-date-text">
        Available until <b>{dayjs(expirationDate).format('MMM D, YYYY')}</b>
      </p>
    )}

    {searchCoursesCta && (
      <Row className="mt-3 d-flex justify-content-end">
        <Col xl={12}>{searchCoursesCta}</Col>
      </Row>
    )}
  </SidebarCard>
);

LearnerCreditSummaryCard.propTypes = {
  expirationDate: PropTypes.string.isRequired,
  className: PropTypes.string,
  searchCoursesCta: PropTypes.node,
};

LearnerCreditSummaryCard.defaultProps = {
  className: undefined,
  searchCoursesCta: undefined,
};

export default LearnerCreditSummaryCard;
