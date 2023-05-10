export function getSkillQuiz(skillsQuizes) {
  if (skillsQuizes && skillsQuizes.results.length > 0) {
    for (let i = 0; i < skillsQuizes.results.length; i++) {
      if (skillsQuizes.results[i].currentJob) {
        return skillsQuizes.results[i];
      }
    }
  }
  return null;
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
