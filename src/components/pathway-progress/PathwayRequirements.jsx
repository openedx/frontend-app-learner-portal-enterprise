import React, { useContext } from 'react';
import { PathwayProgressContext } from './PathwayProgressContextProvider';
import PathwayStep from './PathwayStep';

const PathwayRequirements = () => {
  const { learnerPathwayProgress } = useContext(PathwayProgressContext);
  const getStepNodes = (step) => [...step.courses, ...step.programs];

  return (
    <div className="container mw-lg pathway-header-container">
      <br />
      <section>
        <h2>Pathway Requirements:</h2>
        <div className="pathway-requirements">
          {learnerPathwayProgress.steps.map(
            (step, index) => (
              <PathwayStep index={index} nodes={getStepNodes(step)} />
            ),
          )}
        </div>
      </section>
    </div>
  );
};

export default PathwayRequirements;
