import { sortSkillsCoursesWithCourseCount } from '../utils';

describe('sortSkillsCoursesWithCourseCount', () => {
  test('returns sorted skills based on # of courses in descending order', () => {
    const coursesWithSkills = [
      { key: 'skill-1', value: [{ title: 'course-1' }, { title: 'course-2' }] },
      { key: 'skill-2', value: [{ title: 'course-1' }, { title: 'course-2' }, { title: 'course-3' }] },
      { key: 'skill-3', value: [{ title: 'course-1' }] },
    ];
    const expected = [
      { key: 'skill-2', value: [{ title: 'course-1' }, { title: 'course-2' }, { title: 'course-3' }] },
      { key: 'skill-1', value: [{ title: 'course-1' }, { title: 'course-2' }] },
      { key: 'skill-3', value: [{ title: 'course-1' }] },
    ];
    expect(sortSkillsCoursesWithCourseCount(coursesWithSkills)).toEqual(expected);
  });
});
