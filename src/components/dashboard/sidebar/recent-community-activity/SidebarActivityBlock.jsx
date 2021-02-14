import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

const SidebarActivityBlock = ({
  className,
  children,
  timestamp,
  timesince,
}) => (
  <li className={className}>
    <div>
      {children}
    </div>
    <div className="text-gray-700 small" title={moment(timestamp).format('MMMM DD, YYYY h:mm A')}>
      {timesince} ago
    </div>
  </li>
);

SidebarActivityBlock.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  timestamp: PropTypes.string.isRequired,
  timesince: PropTypes.string.isRequired,
};

SidebarActivityBlock.defaultProps = {
  className: undefined,
};

export default SidebarActivityBlock;
