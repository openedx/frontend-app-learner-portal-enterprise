import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import Plotly from 'plotly.js-dist';

import { getLearnerSkillLevels, getLearnerSkillQuiz } from './service';
import { getSpiderChartData, prepareSpiderChartData } from './utils';

export function useLearnerSkillQuiz(username) {
  const [learnerSkillQuiz, setLearnerSkillQuiz] = useState();
  const [fetchError, setFetchError] = useState();

  useEffect(() => {
    const fetchData = async () => {
      if (username) {
        try {
          const response = await getLearnerSkillQuiz(username);
          setLearnerSkillQuiz(response.data);
        } catch (error) {
          logError(error);
          setFetchError(error);
        }
      }
      return undefined;
    };
    fetchData();
  }, [username]);
  return [camelCaseObject(learnerSkillQuiz), fetchError];
}

export function useLearnerSkillLevels(jobId) {
  const [learnerSkillLevels, setLearnerSkillLevels] = useState();
  const [fetchError, setFetchError] = useState();

  useEffect(() => {
    const fetchData = async () => {
      if (jobId) {
        try {
          const response = await getLearnerSkillLevels(jobId);
          setLearnerSkillLevels(response.data);
        } catch (error) {
          logError(error);
          setFetchError(error);
        }
      }
      return undefined;
    };
    fetchData();
  }, [jobId]);
  return [camelCaseObject(learnerSkillLevels), fetchError];
}

export function usePlotlySpiderChart(categories) {
  useEffect(() => { // eslint-disable-line consistent-return
    if (!categories) {
      return [];
    }

    const [
      jobName,
      topCategories,
      averageScores,
      learnerScores,
    ] = prepareSpiderChartData(categories);

    const [data, layout] = getSpiderChartData(
      jobName,
      topCategories,
      averageScores,
      learnerScores,
    );

    Plotly.newPlot('skill-levels-spider', data, layout);
  }, [categories]);
}
