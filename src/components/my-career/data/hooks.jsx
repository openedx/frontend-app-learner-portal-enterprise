import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import Plotly from 'plotly.js-dist';
import { getLearnerProfileInfo, getLearnerSkillLevels } from './service';
import { getSpiderChartData, prepareSpiderChartData } from './utils';

export function useLearnerProfileData(username) {
  const [isLoading, setIsLoading] = useState(false);
  const [learnerProfileData, setLearnerProfileData] = useState();
  const [fetchError, setFetchError] = useState();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (username) {
        try {
          const data = await getLearnerProfileInfo(username);
          setLearnerProfileData(camelCaseObject(data));
        } catch (error) {
          logError(error);
          setFetchError(error);
        }
      }
      setIsLoading(false);
    };
    fetchData();
  }, [username]);
  return [learnerProfileData, fetchError, isLoading];
}

export function useLearnerSkillLevels(jobId) {
  const [learnerSkillLevels, setLearnerSkillLevels] = useState();
  const [fetchError, setFetchError] = useState();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (jobId) {
        try {
          const response = await getLearnerSkillLevels(jobId);
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
  useEffect(() => { // eslint-disable-line consistent-return
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
