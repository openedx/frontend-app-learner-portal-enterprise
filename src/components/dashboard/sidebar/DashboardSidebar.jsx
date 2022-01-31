import React from 'react';

import { Card } from '@edx/paragon';
import SupportInformation from './SupportInformation';
import SubsidiesSummary from './SubsidiesSummary';

const DashboardSidebar = () => (
  <div className="mt-3 mt-lg-0">
    <SubsidiesSummary />
    <Card>
      <Card.Body>
        <SupportInformation />
      </Card.Body>
    </Card>
  </div>
);

export default DashboardSidebar;
