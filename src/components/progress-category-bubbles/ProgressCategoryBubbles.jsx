import React from 'react';
import { Bubble, Stack } from '@openedx/paragon';
import PropTypes from 'prop-types';
import './styles/index.scss';

const ProgressCategoryBubbles = ({ notStarted, inProgress, completed }) => (
  <Stack direction="horizontal" gap={2} className="flex-wrap">
    <Bubble className="remaining-courses" data-testid="remaining-count">
      {notStarted}
    </Bubble>
    <div>Remaining</div>

    <Bubble className="in-progress-courses" data-testid="in-progress-count">
      {inProgress}
    </Bubble>
    <div>In progress</div>

    <Bubble className="completed-courses" data-testid="completed-count">
      {completed}
    </Bubble>
    <div>Completed</div>
  </Stack>
);

ProgressCategoryBubbles.propTypes = {
  notStarted: PropTypes.number.isRequired,
  inProgress: PropTypes.number.isRequired,
  completed: PropTypes.number.isRequired,
};

export default ProgressCategoryBubbles;
