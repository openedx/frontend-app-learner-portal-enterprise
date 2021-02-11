import React from 'react';
import PropTypes from 'prop-types';
import { Hyperlink } from '@edx/paragon';
import { Link } from 'react-router-dom';

import { SidebarBlock } from '../../layout';

const ActivityBlock = ({
  className,
  children,
  timestamp,
  timesince,
}) => (
  <li className={className}>
    <div>
      {children}
    </div>
    <div className="text-gray-700 small" title={timestamp}>
      {timesince} ago
    </div>
  </li>
);

ActivityBlock.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  timestamp: PropTypes.string.isRequired,
  timesince: PropTypes.string.isRequired,
};

ActivityBlock.defaultProps = {
  className: undefined,
};

const RecentCommunityActivityBlock = () => (
  <SidebarBlock
    title="Recent community activity"
    titleProps={{ as: 'h3' }}
    className="mb-5"
  >
    <ul className="list-unstyled">
      <ActivityBlock
        className="mb-3"
        timestamp="2021-01-10 10:00:00"
        timesince="12 minutes"
      >
        <Hyperlink
          href="https://profile.edx.org/u/astankiewicz_edx"
          className="font-weight-bold"
          target="_blank"
        >
          {/* TODO: use "First Last" name if available (more human), otherwise use username */}
          astankiewicz_edx
        </Hyperlink>
        {' '}
        earned a certificate in
        {' '}
        <Link to="/test-enterprise/course/edX+DemoX">
          Demonstration Course
        </Link>
      </ActivityBlock>
      <ActivityBlock
        className="mb-3"
        timestamp="2021-01-10 12:00:00"
        timesince="53 minutes"
      >
        <Hyperlink
          href="https://profile.edx.org/u/edx"
          className="font-weight-bold"
          target="_blank"
        >
          edx
        </Hyperlink>
        {' '}
        enrolled in
        {' '}
        <Link to="/test-enterprise/course/edX+DemoX">
          Demonstration Course
        </Link>
      </ActivityBlock>
      <ActivityBlock
        timestamp="2021-01-10 10:00:00"
        timesince="2 hours"
      >
        <Hyperlink
          href="https://profile.edx.org/u/jchaves"
          className="font-weight-bold"
          target="_blank"
        >
          jchaves
        </Hyperlink>
        {' '}
        joined
        {' '}
        Test Enterprise
      </ActivityBlock>
    </ul>
    <Link to="/test-enterprise/community">
      View all community activity →
    </Link>
  </SidebarBlock>
);

export default RecentCommunityActivityBlock;
