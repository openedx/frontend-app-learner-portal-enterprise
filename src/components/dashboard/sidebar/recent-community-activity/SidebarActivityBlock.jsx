import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

const SidebarActivityBlock = ({
  className,
  children,
  timestamp,
}) => {
  const formatTimestamp = () => moment(timestamp).fromNow();

  const [formattedTimeSince, setFormattedTimeSince] = useState(formatTimestamp(timestamp));

  useEffect(
    () => {
      // refresh formatted time since every minute
      const refreshInterval = setInterval(() => {
        setFormattedTimeSince(formatTimestamp(timestamp));
      }, 60000);

      // clean up on unmount
      return () => {
        clearInterval(refreshInterval);
      };
    },
    [timestamp],
  );

  return (
    <li className={className}>
      <div>
        {children}
      </div>
      <div className="text-gray-700 small" title={moment(timestamp).format('MMMM DD, YYYY h:mm A')}>
        {formattedTimeSince}
      </div>
    </li>
  );
};

SidebarActivityBlock.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  timestamp: PropTypes.string.isRequired,
};

SidebarActivityBlock.defaultProps = {
  className: undefined,
};

export default SidebarActivityBlock;
