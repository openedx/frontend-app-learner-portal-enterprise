export default function coursesAndProgramsText(pathway) {
  let courseCount = 0;
  let programCount = 0;
  let textCourse = '';
  let textProgram = '';
  let message;

  for (let i = 0; i < pathway.steps.length; i++) {
    courseCount += pathway.steps[i].courses?.length;
    programCount += pathway.steps[i].programs?.length;
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
