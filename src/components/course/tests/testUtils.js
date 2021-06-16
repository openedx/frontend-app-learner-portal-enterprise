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
export const generateRandomSkills = (skillCount) => {
  const skillsData = Array(skillCount).fill(1).map((item, index) => ({
    name: `Test skill ${++index}`, // eslint-disable-line no-param-reassign
    description: `Description for Test Skill ${index}`,
  }));
  return skillsData;
};

export const generateRandomString = (MAX_LENGTH) => {
  // form strings b/w 5-10 characters
  const min = Math.ceil(5);
  const max = Math.floor(10);
  const result = [];
  let stringLength = 0;
  let arrStr = '';
  while (stringLength < MAX_LENGTH) {
    const randomInt = Math.floor(Math.random() * (max - min + 1)) + min;
    const arr = new Array(randomInt).fill('s');
    arrStr = arr.join('');
    result.push(arrStr);
    stringLength = stringLength + randomInt + 1; // + 1 for space b/w strings
  }
  // there might be a chance that we get a string larger than MX_LENGTH based on the random integer value,
  // to ensure the length is equal to MAX_LENGTH passed, we slice the string
  let resStr = result.join(' ');
  if (resStr.length > MAX_LENGTH) {
    resStr = resStr.substr(0, MAX_LENGTH);
  }
  return resStr;
};
