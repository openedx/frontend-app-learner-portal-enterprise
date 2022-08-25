export const getProgressFromSteps = (pathwaySteps) => {
  const progress = { notStarted: 0, inProgress: 0, completed: 0 };
  const steps = pathwaySteps.map(step => ({
    status: step.status,
    nodes: [step.courses, step.programs].flat(),
  }));
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (step.status === 100) {
      progress.completed++;
    } else if (step.status > 0) {
      progress.inProgress++;
    } else if (step.nodes.some((node => node.status !== 'NOT_STARTED'))) {
      progress.inProgress++;
    } else {
      progress.notStarted++;
    }
  }
  return progress;
};
