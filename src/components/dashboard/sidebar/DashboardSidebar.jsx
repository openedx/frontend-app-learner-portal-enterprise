import React from 'react';

import { Card } from '@openedx/paragon';
import SupportInformation from './SupportInformation';
import SubsidiesSummary from './SubsidiesSummary';

const DashboardSidebar = () => (
  <div className="mt-3 mt-lg-0">
    <SubsidiesSummary />
    <Card>
      <Card.Section>
        <SupportInformation />
      </Card.Section>
    </Card>
  </div>
);

export default DashboardSidebar;
