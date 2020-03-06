import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';
import MediaQuery from 'react-responsive';
import { breakpoints } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';

import { EnterpriseBanner } from '../enterprise-banner';
import { MainContent, Sidebar } from '../layout';
import { DashboardMainContent } from './main-content';
import { DashboardSidebar } from './sidebar';

export default function Dashboard() {
  const { enterpriseConfig } = useContext(AppContext);

  return (
    <>
      <Helmet title={enterpriseConfig.name} />
      <EnterpriseBanner />
      <div className="container-fluid py-5">
        <div className="row">
          <MainContent>
            <DashboardMainContent />
          </MainContent>
          <MediaQuery minWidth={breakpoints.large.minWidth}>
            {matches => matches && (
              <Sidebar>
                <DashboardSidebar />
              </Sidebar>
            )}
          </MediaQuery>
        </div>
      </div>
    </>
  );
}
