import React, { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { UserSubsidyContext } from '.';
import OffersAlert from './OffersAlert';
import SubscriptionSubsidy from './SubscriptionSubsidy';

const UserSubsidyAlerts = () => {
  const { enterpriseConfig, subscriptionPlan } = useContext(AppContext);
  const { subscriptionLicense, offers } = useContext(UserSubsidyContext);

  return (
    <>
      {offers && <OffersAlert offers={offers} />}
      {/**
       * SubscriptionSubsidy takes care of redirecting the user to `/${enterpriseConfig.slug}`
       * if their organization has a subscription plan but they don't have appropriate access
       * to a license (i.e., status="activated"). it also handles the case where the organization
       * has an active subscription plan but the current date is not between the plan's start and
       * expiration dates. The component also handles rendering warning/error status alerts.
       */}
      <SubscriptionSubsidy
        enterpriseConfig={enterpriseConfig}
        plan={subscriptionPlan}
        license={subscriptionLicense}
        offersCount={offers?.offersCount}
      />

    </>
  );
};

export default UserSubsidyAlerts;
