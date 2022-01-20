import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

import PropTypes from 'prop-types';
import OfferSummaryCard from './OfferSummaryCard';
import SubscriptionSummaryCard from './SubscriptionSummaryCard';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';
import { CATALOG_ACCESS_CARD_BUTTON_TEXT } from './data/constants';
import SidebarCard from './SidebarCard';

const SubsidiesSummary = ({ className, showSearchCoursesCta }) => {
  const {
    enterpriseConfig: {
      slug,
      disableSearch,
    },
  } = useContext(AppContext);

  const {
    subscriptionPlan,
    subscriptionLicense: userSubscriptionLicense,
    offers: { offersCount },
    hasActiveSubsidies,
  } = useContext(UserSubsidyContext);

  if (!hasActiveSubsidies) {
    return null;
  }

  return (
    <SidebarCard cardClassNames="border-primary border-brand-primary catalog-access-card mb-5">
      <div className={className} data-testid="subsidies-summary">
        {
          (subscriptionPlan && userSubscriptionLicense?.status === LICENSE_STATUS.ACTIVATED) && (
            <SubscriptionSummaryCard
              subscriptionPlan={subscriptionPlan}
              className="mb-3"
            />
          )
        }
        {offersCount > 0 && (
          <OfferSummaryCard
            offersCount={offersCount}
            className="mb-3"
          />
        )}
        {!disableSearch && showSearchCoursesCta && (
          <Link
            to={`/${slug}/search`}
            className="btn btn-outline-primary btn-block"
          >
            {CATALOG_ACCESS_CARD_BUTTON_TEXT}
          </Link>
        )}
      </div>
    </SidebarCard>
  );
};

SubsidiesSummary.propTypes = {
  className: PropTypes.string,
  showSearchCoursesCta: PropTypes.bool,
};

SubsidiesSummary.defaultProps = {
  className: undefined,
  showSearchCoursesCta: true,
};

export default SubsidiesSummary;
