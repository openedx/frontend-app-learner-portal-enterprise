// get common skills between a course/program and the job selected by the learner
// here content can either be a course or a program
export default function getCommonSkills(content, selectedJobSkills, MAX_VISIBLE_SKILLS) {
  const contentSkills = content.skillNames || [];
  return contentSkills.filter(skill => selectedJobSkills.includes(skill)).slice(0, MAX_VISIBLE_SKILLS);
}
