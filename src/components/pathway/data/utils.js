export default function coursesAndProgramsText(pathway) {
  let courseCount = 0;
  let programCount = 0;
  let textCourse = '';
  let textProgram = '';
  let message;

  for (let i = 0; i < pathway.steps.length; i++) {
    /* eslint-disable no-unsafe-optional-chaining */
    courseCount += pathway.steps[i].courses?.length;
    programCount += pathway.steps[i].programs?.length;
    /* eslint-enable no-unsafe-optional-chaining */
  }

  textCourse = courseCount === 1 ? 'course' : 'courses';
  textProgram = programCount === 1 ? 'program' : 'programs';

  if (courseCount && programCount) {
    message = `${courseCount} ${textCourse} and ${programCount} ${textProgram}`;
  } else if (courseCount && !programCount) {
    message = `${courseCount} ${textCourse}`;
  } else if (!courseCount && programCount) {
    message = `${programCount} ${textProgram}`;
  }

  return message;
}
