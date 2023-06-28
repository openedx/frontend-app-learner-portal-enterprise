import { CURRENT_JOB_PROFILE_FIELD_NAME } from './constants';

export function extractCurrentJobID(profileData) {
  let currentJobID;
  if (profileData) {
    const { extendedProfile } = profileData;
    if (extendedProfile?.length > 0) {
      extendedProfile.forEach((field) => {
        if (field.fieldName === CURRENT_JOB_PROFILE_FIELD_NAME) {
          currentJobID = field.fieldValue;
        }
      });
    }
  }
  return currentJobID;
}

export function prepareSpiderChartData(categories) {
  const jobName = categories.name;
  const topCategories = [];
  const averageScores = [];
  const learnerScores = [];

  // eslint-disable-next-line react/prop-types
  categories.skillCategories.forEach((skillCategory) => {
    topCategories.push(skillCategory.name);
    averageScores.push(skillCategory.edxAverageScore || 0);
    learnerScores.push(skillCategory.userScore || 0);
  });

  return [jobName, topCategories, averageScores, learnerScores];
}

export function getSpiderChartData(jobName, topCategories, averageScores, learnerScores) {
  const data = [
    {
      type: 'scatterpolar',
      r: learnerScores,
      theta: topCategories,
      fill: 'toself',
      color: '#00262B',
      line: {
        color: '#00262B',
      },
      opacity: 0.7,
      name: 'My Skills',
    },
    {
      type: 'scatterpolar',
      r: averageScores,
      theta: topCategories,
      fill: 'toself',
      color: 'grey',
      line: {
        color: 'grey',
      },
      opacity: 0.3,
      name: jobName,
    },
  ];

  const layout = {
    width: 600,
    polar: {
      radialaxis: {
        visible: true,
        range: [0, 1],
      },
      showlegend: true,
    },
  };
  const config = {
    displayModeBar: false,
  };

  return [data, layout, config];
}
