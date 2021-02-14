import React from 'react';

import { SidebarBlock } from '../../../layout';
import CommunityFeed from './CommunityFeed';

const RecentCommunityActivityBlock = () => (
  <SidebarBlock title="Recent community activity" className="mb-5 position-relative">
    <CommunityFeed />
  </SidebarBlock>
);

export default RecentCommunityActivityBlock;
