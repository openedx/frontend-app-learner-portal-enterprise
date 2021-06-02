// Generate an array of random skills with name and description key value pairs.
/*
Example:
[
  {
    "name": "Test Skill 1",
    "description": "Description for Test Skill"
  },
  {
    "name": "Test Skill 2",
    "description": "Description for Test Skill"
  },
  {
    "name": "Test Skill 3",
    "description": "Description for Test Skill"
  }
]
*/
const generateRandomSkills = (skillCount) => {
  const skillsData = Array(skillCount).fill(1).map((item, index) => ({
    name: `Test skill ${++index}`, // eslint-disable-line no-param-reassign
    description: `Description for Test Skill ${index}`,
  }));
  return skillsData;
};

export default generateRandomSkills;
