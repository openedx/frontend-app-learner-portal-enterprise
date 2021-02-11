import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Input, Button, Card, Avatar,
} from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';

const ActivityBlock = ({
  className,
  children,
  timestamp,
  timesince,
}) => {
  const { authenticatedUser } = useContext(AppContext);
  const [isCommentBoxVisible, setIsCommentBoxVisible] = useState(false);

  return (
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
              {/* reactions */}
              <div className="mt-3 d-flex align-items-center">
                <Button
                  variant="link"
                  size="sm"
                  className="px-0 mr-2"
                >
                  Like
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  className="px-0"
                  onClick={() => setIsCommentBoxVisible(prevState => !prevState)}
                >
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </Card.Body>
        {isCommentBoxVisible && (
          <Card.Footer className="bg-light-100">
            <div className="d-flex align-items-start">
              <Avatar
                className="mr-2"
                src={authenticatedUser?.profileImage?.hasImage ? authenticatedUser.profileImage.medium : undefined}
                alt={authenticatedUser?.username}
                size="sm"
              />
              <Input type="textarea" />
            </div>
          </Card.Footer>
        )}
      </Card>
    </li>
  );
};

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
