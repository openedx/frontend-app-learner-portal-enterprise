import React, { useContext } from 'react';
import { Breadcrumb } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { useParams } from 'react-router-dom';
import { PathwayProgressContext } from './PathwayProgressContextProvider';
import SubscriptionStatusCard from './SubscriptionStatusCard';

const PathwayProgressHeader = () => {
  const { learnerPathwayProgress } = useContext(PathwayProgressContext);
  const { enterpriseSlug } = useParams();
  const links = [
    { label: 'Dashboard', url: `/${enterpriseSlug}` },
    { label: 'Pathways', url: `/${enterpriseSlug}` }, // Redirect to dashboard page, user can then select pathways tab.
  ];
  return (
    <header className="pathway-header">
      <div className="container mw-lg pathway-header-container">
        <div className="header-breadcrumbs ml-2">
          <Breadcrumb
            links={links}
            activeLabel={learnerPathwayProgress.title}
          />
        </div>
        <div>
          <h1 className="display-1">{learnerPathwayProgress.title}</h1>
          <br />
        </div>
        <section>
          <h2 className="">
            <FormattedMessage
              id="enterprise.dashboard.pathways.progress.page.pathway.progress.heading"
              defaultMessage="Pathway Progress"
              description="Heading displayed on the pathway progress page to indicate the progress of a pathway"
            />
          </h2>
          <div className="row">
            <p className="col-6">
              <FormattedMessage
                id="enterprise.dashboard.pathways.progress.page.pathway.progress.subheading"
                defaultMessage="Review your progress through the pathway and plan for key deadlines to ensure you finish.
                To complete the pathway, you must complete each of the requirements."
                description="Subheading displayed on the pathway progress page for reviewing progress and meeting pathway requirements."
              />
            </p>
          </div>
          <SubscriptionStatusCard />
        </section>
      </div>
    </header>
  );
};

export default PathwayProgressHeader;
