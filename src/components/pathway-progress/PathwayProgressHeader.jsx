import React, { useContext } from 'react';
import { Breadcrumb } from '@openedx/paragon';

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
          <h2 className="">Pathway Progress</h2>
          <div className="row">
            <p className="col-6">
              Review your progress through the pathway and plan for key deadlines to ensure you finish.
              To complete the pathway, you must complete each of the requirements.
            </p>
          </div>
          <SubscriptionStatusCard />
        </section>
      </div>
    </header>
  );
};

export default PathwayProgressHeader;
