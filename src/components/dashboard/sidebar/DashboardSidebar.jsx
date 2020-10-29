import React, { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';

import { SidebarBlock } from '../../layout';
import OfferSummaryCard from './OfferSummaryCard';
import SubscriptionSummaryCard from './SubscriptionSummaryCard';
import ButtonWithLink from '../../layout/ButtonWithLink';
import SidebarCard from './SidebarCard';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';

export const CATALOG_ACCESS_CARD_TITLE = 'Catalog Access';
export const CATALOG_ACCESS_CARD_BUTTON_TEXT = 'Find a course';
export const NEED_HELP_BLOCK_TITLE = 'Need help?';
export const EMAIL_MESSAGE = 'contact your organization\'s edX administrator';

const DashboardSidebar = () => {
  const {
    enterpriseConfig: {
      contactEmail,
    },
    subscriptionPlan,
  } = useContext(AppContext);
  const { offers: { offersCount } } = useContext(UserSubsidyContext);

  const renderContactHelpText = () => {
    const message = EMAIL_MESSAGE;
    if (contactEmail) {
      return (
        <a className="text-underline" href={`mailto:${contactEmail}`}>
          {message}
        </a>
      );
    }
    return message;
  };

  return (
    <>
      <SidebarCard
        title={CATALOG_ACCESS_CARD_TITLE}
        cardClassNames="border-primary catalog-access-card mb-5"
        titleClassNames="mb-3"
      >
        { subscriptionPlan && (
          <SubscriptionSummaryCard
            subscriptionPlan={subscriptionPlan}
            className="mb-3"
          />
        )}
        { offersCount > 0 && (
          <OfferSummaryCard
            offersCount={offersCount}
            className="mb-3"
          />
        )}
        <ButtonWithLink
          className="btn-outline-primary btn-block"
          text={CATALOG_ACCESS_CARD_BUTTON_TEXT}
          link="/search"
          linkIsLocal
        />
      </SidebarCard>
      <SidebarBlock
        title={NEED_HELP_BLOCK_TITLE}
        titleOptions={{ tag: 'h3', className: 'h4' }}
        className="mb-5"
      >
        <p>
          For technical support, visit the{' '}
          <a className="text-underline" href="https://support.edx.org/hc/en-us">edX Help Center</a>.
        </p>
        <p>
          To request more benefits or specific courses, {renderContactHelpText()}.
        </p>
      </SidebarBlock>
    </>
  );
};

export default DashboardSidebar;
