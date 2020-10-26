import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';

import { SidebarBlock } from '../../layout';
import OfferSummaryCard from './OfferSummaryCard';
import SubscriptionSummaryCard from './SubscriptionSummaryCard';
import ButtonWithLink from '../../layout/ButtonWithLink';
import SidebarCard from './SidebarCard';

export const EMAIL_MESSAGE = 'contact your organization\'s edX administrator';

class DashboardSidebar extends React.Component {
  renderContactHelpText() {
    const { enterpriseConfig: { contactEmail } } = this.context;

    const message = EMAIL_MESSAGE;

    if (contactEmail) {
      return (
        <a className="text-underline" href={`mailto:${contactEmail}`}>
          {message}
        </a>
      );
    }
    return message;
  }

  render() {
    return (
      <>
        <SidebarCard title="Catalog Access" cardClassNames="border-primary">
          <SubscriptionSummaryCard
            subscriptionPlan={this.context.subscriptionPlan}
            className="mb-3"
          />
          <OfferSummaryCard className="mb-3" />
          <ButtonWithLink
            className="btn-outline-primary btn-block"
            text="Find a course"
            link="/search"
            linkIsLocal
          />
        </SidebarCard>
        <SidebarBlock
          title="Need help?"
          titleOptions={{ tag: 'h3', className: 'h4' }}
          className="mb-5"
        >
          <p>
            For technical support, visit the{' '}
            <a className="text-underline" href="https://support.edx.org/hc/en-us">edX Help Center</a>.
          </p>
          <p>
            To request more benefits or specific courses, {this.renderContactHelpText()}.
          </p>
        </SidebarBlock>
      </>
    );
  }
}

DashboardSidebar.contextType = AppContext;

export default DashboardSidebar;
