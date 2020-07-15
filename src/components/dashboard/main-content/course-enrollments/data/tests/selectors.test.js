import {
  filterCourseRuns,
} from '../selectors';
import { createRawCourseRun } from '../../tests/enrollment-testutils';

describe('getCourseRunsByStatus', () => {
  it('categorizes in_progress and upcoming courses correctly', () => {
    const inProgressCourse = createRawCourseRun();
    const upcomingCourse = { ...createRawCourseRun(), courseRunStatus: 'upcoming' };
    const result = filterCourseRuns([inProgressCourse, upcomingCourse]);
    expect(result.in_progress[0].courseRunStatus).toEqual('in_progress');
    expect(result.in_progress.length).toEqual(1);
    expect(result.upcoming.length).toEqual(1);
    expect(result.upcoming[0].courseRunStatus).toEqual('upcoming');
    expect(result.completed.length).toEqual(0);
    expect(result.savedForLater.length).toEqual(0);
  });
  describe('it categorizes completed and saved for later courses correctly', () => {
    const completedCourse = { ...createRawCourseRun(), courseRunStatus: 'completed', };
    const savedForLaterCourse = { ...createRawCourseRun(), courseRunStatus: 'completed', savedForLater: true, };
    const result = filterCourseRuns([completedCourse, savedForLaterCourse]);
    expect(result.completed[0].courseRunStatus).toEqual('completed');
    expect(result.completed[0].savedForLater).toEqual(false);
    expect(result.completed.length).toEqual(1);
    expect(result.savedForLater.length).toEqual(1);
    expect(result.savedForLater[0].courseRunStatus).toEqual('completed');
    expect(result.savedForLater[0].savedForLater).toEqual(true);
    expect(result.in_progress.length).toEqual(0);
    expect(result.upcoming.length).toEqual(0);
  });
});
