import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';
import MediaQuery from 'react-responsive';
import { breakpoints } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';

import { MainContent, Sidebar } from '../layout';
import { DashboardMainContent } from './main-content';
import { DashboardSidebar } from './sidebar';

export default function Dashboard() {
  const { enterpriseConfig } = useContext(AppContext);

  const PAGE_TITLE = `My courses - ${enterpriseConfig.name}`;

  return (
    <>
      <Helmet title={PAGE_TITLE} />
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
