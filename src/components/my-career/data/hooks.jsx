import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import Plotly from 'plotly.js-dist';
import { fetchLearnerSkillLevels } from './service';
import { getSpiderChartData, prepareSpiderChartData } from './utils';

export function useLearnerSkillLevels(jobId) {
  const [learnerSkillLevels, setLearnerSkillLevels] = useState();
  const [fetchError, setFetchError] = useState();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (jobId) {
        try {
          const response = await fetchLearnerSkillLevels(jobId);
          setLearnerSkillLevels(response.data);
        } catch (error) {
          logError(error);
          setFetchError(error);
        }
      }
      setIsLoading(false);
      return undefined;
    };
    fetchData();
  }, [jobId]);
  return [camelCaseObject(learnerSkillLevels), fetchError, isLoading];
}

export function usePlotlySpiderChart(categories) {
  useEffect(() => {
    if (!categories) {
      return;
    }
    const [
      jobName,
      topCategories,
      averageScores,
      learnerScores,
    ] = prepareSpiderChartData(categories);
    const [data, layout, config] = getSpiderChartData(
      jobName,
      topCategories,
      averageScores,
      learnerScores,
    );

    Plotly.newPlot('skill-levels-spider', data, layout, config);
  }, [categories]);
}
