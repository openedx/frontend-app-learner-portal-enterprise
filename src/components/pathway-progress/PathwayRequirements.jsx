import React, { useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { PathwayProgressContext } from './PathwayProgressContextProvider';
import PathwayStep from './PathwayStep';

const PathwayRequirements = () => {
  const { learnerPathwayProgress } = useContext(PathwayProgressContext);
  const getStepNodes = (step) => [...step.courses, ...step.programs];

  return (
    <div className="container mw-lg pathway-header-container">
      <br />
      <section>
        <h2>
          <FormattedMessage
            id="enterprise.dashboard.pathways.progress.page.pathway.requirements.heading"
            defaultMessage="Pathway Requirements:"
            description="Heading displayed for pathway requirements on the pathway progress page."
          />
        </h2>
        <div className="pathway-requirements">
          {learnerPathwayProgress.steps.map(
            (step, index) => (
              <PathwayStep
                key={uuidv4()}
                index={index}
                nodes={getStepNodes(step)}
              />
            ),
          )}
        </div>
      </section>
    </div>
  );
};

export default PathwayRequirements;
