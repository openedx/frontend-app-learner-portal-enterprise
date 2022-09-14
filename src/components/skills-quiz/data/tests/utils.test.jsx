import { goalLabels, sortSkillsCoursesWithCourseCount } from '../utils';
import {
  DROPDOWN_OPTION_CHANGE_CAREERS,
  DROPDOWN_OPTION_CHANGE_CAREERS_LABEL,
  DROPDOWN_OPTION_GET_PROMOTED,
  DROPDOWN_OPTION_GET_PROMOTED_LABEL,
  DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE,
  DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE_LABEL,
  DROPDOWN_OPTION_OTHER,
  DROPDOWN_OPTION_OTHER_LABEL,
} from '../../constants';

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

describe('returnGoalLabel', () => {
  test('return right goal label', () => {
    expect(goalLabels(DROPDOWN_OPTION_CHANGE_CAREERS)).toEqual(DROPDOWN_OPTION_CHANGE_CAREERS_LABEL);
    expect(goalLabels(DROPDOWN_OPTION_GET_PROMOTED)).toEqual(DROPDOWN_OPTION_GET_PROMOTED_LABEL);
    expect(goalLabels(DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE)).toEqual(DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE_LABEL);
    expect(goalLabels(DROPDOWN_OPTION_OTHER)).toEqual(DROPDOWN_OPTION_OTHER_LABEL);
  });

  test('return other goal label if find no match', () => {
    expect(goalLabels('random string')).toEqual(DROPDOWN_OPTION_OTHER_LABEL);
    expect(goalLabels('')).toEqual(DROPDOWN_OPTION_OTHER_LABEL);
  });
});
