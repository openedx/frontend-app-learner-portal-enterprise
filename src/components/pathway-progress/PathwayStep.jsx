import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Collapsible, Icon } from '@openedx/paragon';
import { ExpandLess, ExpandMore } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import PathwayNode from './PathwayNode';

const PathwayStep = ({ index, nodes }) => {
  const [isOpen, setIsOpen] = useState(true);
  const intl = useIntl();

  const requirementsTitleWithSingleNode = intl.formatMessage(
    {
      id: 'enterprise.dashboard.pathways.progress.page.pathway.requirements.step.title',
      defaultMessage: 'Requirement {index}',
      description: 'Title indicating a single requirement step for a pathway on the pathway progress page.',
    },
    {
      index: index + 1,
    },
  );

  const requirementsTitleWithMultipleNodes = intl.formatMessage(
    {
      id: 'enterprise.dashboard.pathways.progress.page.pathway.requirements.step.title',
      defaultMessage: 'Requirement {index}: Choose any {count} of the following',
      description: 'Title indicating multiple requirements steps for a pathway on the pathway progress page.',
    },
    {
      index: index + 1,
      count: nodes?.length,
    },
  );

  const title = nodes?.length > 1 ? requirementsTitleWithMultipleNodes : requirementsTitleWithSingleNode;

  return (
    <Collapsible
      title={title}
      open={isOpen}
      styling="card-lg"
      className="collapsible shadow-lg pathway-step"
      iconWhenOpen={<Icon src={ExpandLess} />}
      iconWhenClosed={<Icon src={ExpandMore} />}
      onToggle={() => setIsOpen((!isOpen))}
    >
      {
        nodes.map(node => <PathwayNode node={node} />)
      }
    </Collapsible>
  );
};

export default PathwayStep;

PathwayStep.propTypes = {
  index: PropTypes.number.isRequired,
  nodes: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    imageUrl: PropTypes.string,
    destinationUrl: PropTypes.string,
    uuid: PropTypes.string,
    type: PropTypes.string,
  })).isRequired,
};
