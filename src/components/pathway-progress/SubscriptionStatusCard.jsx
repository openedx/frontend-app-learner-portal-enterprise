import { Card, Badge } from '@openedx/paragon';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import dayjs from '../../utils/dayjs';
import { useHasAvailableSubsidiesOrRequests, useSubscriptions } from '../app/data';

const SubscriptionStatusCard = () => {
  const { hasActiveLicenseOrLicenseRequest } = useHasAvailableSubsidiesOrRequests();
  const { data: { subscriptionPlan } } = useSubscriptions();
  const expirationDate = subscriptionPlan?.expirationDate;

  return (
    <div className="row-cols-3 subscription-status-card">
      <Card className="w-40">
        <Card.Section
          className="d-flex flex-column align-items-left justify-content-between"
        >
          <div className="h4 mb-0 d-flex align-items-start justify-content-between">
            <span>
              <FormattedMessage
                id="enterprise.dashboard.pathways.progress.page.subscription.status.label"
                defaultMessage="Subscription Status"
                description="Subscription status label displayed on the pathway progress page."
              />
            </span>
            <Badge variant={hasActiveLicenseOrLicenseRequest ? 'success' : 'danger'}>
              {hasActiveLicenseOrLicenseRequest
                ? (
                  <FormattedMessage
                    id="enterprise.dashboard.pathways.progress.page.active.subscription.badge.label"
                    defaultMessage="Active"
                    description="Active subscription label for subscription card on the pathway progress page"
                  />
                )
                : (
                  <FormattedMessage
                    id="enterprise.dashboard.pathways.progress.page.not.active.subscription.badge.label"
                    defaultMessage="Not Active"
                    description="Not active subscription label for subscription card on the pathway progress page"
                  />
                )}
            </Badge>
          </div>
          {hasActiveLicenseOrLicenseRequest && expirationDate && (
            <div className="subscription-expiry">
              <FormattedMessage
                id="enterprise.dashboard.pathways.progress.page.subscription.card.available.until.date"
                defaultMessage="Available until {expiryDate}"
                description="Available until date indicating the availability period for a subscription card on the pathway progress page"
                values={{
                  expiryDate: (
                    <span className="font-weight-bold">
                      {dayjs(expirationDate).format('MMMM Do, YYYY')}
                    </span>
                  ),
                }}
              />
            </div>
          )}
        </Card.Section>
      </Card>
    </div>
  );
};

export default SubscriptionStatusCard;
