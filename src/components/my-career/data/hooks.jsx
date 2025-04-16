import { useEffect } from 'react';

import Plotly from 'plotly.js-dist';
import { getSpiderChartData, prepareSpiderChartData } from './utils';

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
