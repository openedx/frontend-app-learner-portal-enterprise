import React from 'react';
import PropTypes from 'prop-types';
import { Card, Avatar } from '@edx/paragon';

const ActivityBlock = ({
  className,
  children,
  timestamp,
  timesince,
}) => (
  <li className={className}>
    <Card>
      <Card.Body>
        <div className="d-flex">
          <Avatar className="flex-grow-0 mr-3" />
          <div>
            {children}
            <div className="text-gray-700 small" title={timestamp}>
              {timesince} ago
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
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

export default ActivityBlock;
