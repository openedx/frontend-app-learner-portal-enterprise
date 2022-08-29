import { camelCaseObject } from '@edx/frontend-platform/utils';
import LearnerPathwayProgressData from '../__mocks__/PathwayProgressListData.json';
import { getProgressFromSteps } from '../utils';

describe('getProgressFromSteps', () => {
  it('returns correct no of steps in all categories', () => {
    const pathwayData = camelCaseObject(LearnerPathwayProgressData)[0];
    const result = getProgressFromSteps(pathwayData.learnerPathwayProgress.steps);
    expect(result.notStarted).toBe(1);
    expect(result.inProgress).toBe(3);
    expect(result.completed).toBe(1);
  });
});
