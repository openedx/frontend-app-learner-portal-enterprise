import React from 'react';
import { Bubble, Stack } from '@edx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import './styles/index.scss';

const ProgressCategoryBubbles = ({ notStarted, inProgress, completed }) => (
  <Stack direction="horizontal" gap={2} className="flex-wrap">
    <Bubble className="remaining-courses" data-testid="remaining-count">
      {notStarted}
    </Bubble>
    <div>
      <FormattedMessage
        id="enterprise.dashboard.programs.program.listing.card.remaining.courses.count"
        defaultMessage="Remaining"
        description="Label for remaining courses count on program card"
      />
    </div>

    <Bubble className="in-progress-courses" data-testid="in-progress-count">
      {inProgress}
    </Bubble>
    <div>
      <FormattedMessage
        id="enterprise.dashboard.programs.program.listing.card.inProgress.courses.count"
        defaultMessage="In progress"
        description="Label for in progress courses count on program card"
      />
    </div>

    <Bubble className="completed-courses" data-testid="completed-count">
      {completed}
    </Bubble>
    <div>
      <FormattedMessage
        id="enterprise.dashboard.programs.program.listing.card.completed.courses.count"
        defaultMessage="Completed"
        description="Label for completed courses count on program card"
      />
    </div>
  </Stack>
);

ProgressCategoryBubbles.propTypes = {
  notStarted: PropTypes.number.isRequired,
  inProgress: PropTypes.number.isRequired,
  completed: PropTypes.number.isRequired,
};

export default ProgressCategoryBubbles;
