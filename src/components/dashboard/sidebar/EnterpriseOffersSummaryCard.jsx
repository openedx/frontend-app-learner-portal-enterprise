import React from 'react';
import PropTypes from 'prop-types';
import {
  Badge,
  Row,
  Col,
} from '@edx/paragon';
import {
  ENTERPRISE_OFFER_SUMMARY_CARD_TITLE,
  ENTERPRISE_OFFER_ACTIVE_BADGE_LABEL,
  ENTERPRISE_OFFER_ACTIVE_BADGE_VARIANT,
  ENTERPRISE_OFFER_SUMMARY_CARD_SUMMARY,
} from './data/constants';
import SidebarCard from './SidebarCard';

const EnterpriseOffersSummaryCard = ({ className, searchCoursesCta }) => (
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
    {ENTERPRISE_OFFER_SUMMARY_CARD_SUMMARY}
    {searchCoursesCta && (
      <Row className="mt-3 d-flex justify-content-end">
        <Col xl={7}>{searchCoursesCta}</Col>
      </Row>
    )}
  </SidebarCard>
);

EnterpriseOffersSummaryCard.propTypes = {
  className: PropTypes.string,
  searchCoursesCta: PropTypes.node,
};

EnterpriseOffersSummaryCard.defaultProps = {
  className: undefined,
  searchCoursesCta: undefined,
};

export default EnterpriseOffersSummaryCard;
