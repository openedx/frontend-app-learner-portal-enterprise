import {
  filterCourseRuns,
} from '../selectors';
import { COURSE_STATUSES } from '../constants';
import { createRawCourseRun } from '../../tests/enrollment-testutils';

describe('filterCourseRunsByStatus', () => {
  it('categorizes in_progress and upcoming courses correctly', () => {
    const inProgressCourse = createRawCourseRun();
    const upcomingCourse = { ...createRawCourseRun(), courseRunStatus: COURSE_STATUSES.upcoming };
    const result = filterCourseRuns([inProgressCourse, upcomingCourse]);
    expect(result.in_progress[0].courseRunStatus).toEqual(COURSE_STATUSES.inProgress);
    expect(result.in_progress.length).toEqual(1);
    expect(result.upcoming.length).toEqual(1);
    expect(result.upcoming[0].courseRunStatus).toEqual(COURSE_STATUSES.upcoming);
    expect(result.completed.length).toEqual(0);
    expect(result.savedForLater.length).toEqual(0);
  });
  it('categorizes completed and saved for later courses correctly', () => {
    const completedCourse = { ...createRawCourseRun(), courseRunStatus: COURSE_STATUSES.completed };
    const savedForLaterCourse = {
      ...createRawCourseRun(),
      courseRunStatus: COURSE_STATUSES.completed,
      savedForLater: true,
    };
    const result = filterCourseRuns([completedCourse, savedForLaterCourse]);
    expect(result.completed[0].courseRunStatus).toEqual(COURSE_STATUSES.completed);
    expect(result.completed[0].savedForLater).toEqual(false);
    expect(result.completed.length).toEqual(1);
    expect(result.savedForLater.length).toEqual(1);
    expect(result.savedForLater[0].courseRunStatus).toEqual(COURSE_STATUSES.completed);
    expect(result.savedForLater[0].savedForLater).toEqual(true);
    expect(result.in_progress.length).toEqual(0);
    expect(result.upcoming.length).toEqual(0);
  });
});
