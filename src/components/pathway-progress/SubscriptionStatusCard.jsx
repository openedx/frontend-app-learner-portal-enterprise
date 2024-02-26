import React, { useContext } from 'react';
import { Card, Badge } from '@openedx/paragon';

import dayjs from '../../utils/dayjs';
import { UserSubsidyContext } from '../enterprise-user-subsidy';
import { LICENSE_STATUS } from '../enterprise-user-subsidy/data/constants';
import { SubsidyRequestsContext, SUBSIDY_TYPE } from '../enterprise-subsidy-requests';

const SubscriptionStatusCard = () => {
  const {
    subscriptionPlan,
    subscriptionLicense: userSubscriptionLicense,
  } = useContext(UserSubsidyContext);
  const expirationDate = subscriptionPlan?.expirationDate;

  const {
    requestsBySubsidyType,
  } = useContext(SubsidyRequestsContext);

  const licenseRequests = requestsBySubsidyType[SUBSIDY_TYPE.LICENSE];
  const hasActiveLicenseOrLicenseRequest = (subscriptionPlan
    && userSubscriptionLicense?.status === LICENSE_STATUS.ACTIVATED) || licenseRequests.length > 0;

  return (
    <div className="row-cols-3 subscription-status-card">
      <Card className="w-40">
        <Card.Section
          className="d-flex flex-column align-items-left justify-content-between"
        >
          <div className="h4 mb-0 d-flex align-items-start justify-content-between">
            <span>Subscription Status</span>&nbsp; &nbsp;
            <Badge variant={hasActiveLicenseOrLicenseRequest ? 'success' : 'danger'}>{hasActiveLicenseOrLicenseRequest ? 'Active' : 'Not Active'}</Badge>
          </div>
          {
            hasActiveLicenseOrLicenseRequest && expirationDate && (
              <div className="subscription-expiry">Available until {' '}
                <span className="font-weight-bold">
                  {dayjs(expirationDate).format('MMMM Do, YYYY')}
                </span>
              </div>
            )
          }
        </Card.Section>
      </Card>
    </div>
  );
};

export default SubscriptionStatusCard;
