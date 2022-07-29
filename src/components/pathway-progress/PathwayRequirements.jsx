import React, { useContext } from 'react';
import { PathwayProgressContext } from './PathwayProgressContextProvider';
import PathwayStep from './PathwayStep';

export default function PathwayRequirements() {
  const { pathwayData } = useContext(PathwayProgressContext);

  return (
    <div className="container mw-lg pathway-header-container">
      <br />
      <section>
        <h2>Pathway Requirements:</h2>
        <div className="pathway-requirements">
          {pathwayData.steps.map(
            (step, index) => <PathwayStep index={index} minRequirements={step.minRequirement} nodes={step.nodes} />,
          )}
        </div>
      </section>
    </div>
  );
}
