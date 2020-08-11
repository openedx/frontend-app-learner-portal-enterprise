import { filterCourseRuns } from '../selectors';
import { COURSE_STATUSES } from '../constants';

import { createRawCourseRun } from '../../tests/enrollment-testutils';

describe('filterCourseRunsByStatus', () => {
  it('categorizes courses into the correct course section based on status', () => {
    const inProgressCourse = createRawCourseRun();
    const upcomingCourse = { ...createRawCourseRun(), courseRunStatus: COURSE_STATUSES.upcoming };
    const completedCourse = { ...createRawCourseRun(), courseRunStatus: COURSE_STATUSES.completed };
    const savedForLaterCourse = { ...createRawCourseRun(), courseRunStatus: COURSE_STATUSES.savedForLater };
    const result = filterCourseRuns([
      inProgressCourse,
      upcomingCourse,
      completedCourse,
      savedForLaterCourse,
    ]);

    expect(result.in_progress.length).toEqual(1);
    expect(result.in_progress[0].courseRunStatus).toEqual(COURSE_STATUSES.inProgress);

    expect(result.upcoming.length).toEqual(1);
    expect(result.upcoming[0].courseRunStatus).toEqual(COURSE_STATUSES.upcoming);

    expect(result.completed.length).toEqual(1);
    expect(result.completed[0].courseRunStatus).toEqual(COURSE_STATUSES.completed);

    expect(result.saved_for_later.length).toEqual(1);
    expect(result.saved_for_later[0].courseRunStatus).toEqual(COURSE_STATUSES.savedForLater);
  });
});
