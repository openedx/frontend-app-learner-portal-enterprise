import React from 'react';
import PropTypes from 'prop-types';
import {
  Badge,
  Row,
  Col,
} from '@edx/paragon';
import moment from 'moment';
import {
  ENTERPRISE_OFFER_SUMMARY_CARD_TITLE,
  ENTERPRISE_OFFER_ACTIVE_BADGE_LABEL,
  ENTERPRISE_OFFER_ACTIVE_BADGE_VARIANT,
} from './data/constants';
import SidebarCard from './SidebarCard';

const EnterpriseOffersSummaryCard = ({ className, offer, searchCoursesCta }) => (
  <SidebarCard
    title={
      (
        <div className="d-flex align-items-center justify-content-between">
          <h3 className="m-0">{ENTERPRISE_OFFER_SUMMARY_CARD_TITLE}</h3>
          <Badge
            variant={ENTERPRISE_OFFER_ACTIVE_BADGE_VARIANT}
            className="ml-2"
            data-testid="enterprise-offer-status-badge"
          >
            {ENTERPRISE_OFFER_ACTIVE_BADGE_LABEL}
          </Badge>
        </div>
      )
    }
    cardClassNames={className}
  >
    {offer.remainingBalanceForUser && offer.remainingBalanceForUser !== Number.MAX_VALUE
      ? (
        <p data-testid="offer-summary-text-detailed">
          Apply your <b>${offer.remainingBalanceForUser}</b>{' '}
          balance to enroll into courses.
        </p>
      )
      : (
        <p data-testid="offer-summary-text">
          Apply your organization&apos;s learner credit balance to enroll into courses with no out of pocket cost.
        </p>
      ) }

    {offer.endDatetime
      && (
        <p data-testid="offer-summary-end-date-text">
          Available until <b>{moment(offer.endDatetime).format('MMM D, YYYY')}</b>
        </p>
      )}

    {searchCoursesCta && (
      <Row className="mt-3 d-flex justify-content-end">
        <Col xl={12}>{searchCoursesCta}</Col>
      </Row>
    )}
  </SidebarCard>
);

EnterpriseOffersSummaryCard.propTypes = {
  offer: PropTypes.shape({
    endDatetime: PropTypes.string,
    remainingBalanceForUser: PropTypes.number,
  }).isRequired,
  className: PropTypes.string,
  searchCoursesCta: PropTypes.node,
};

EnterpriseOffersSummaryCard.defaultProps = {
  className: undefined,
  searchCoursesCta: undefined,
};

export default EnterpriseOffersSummaryCard;
