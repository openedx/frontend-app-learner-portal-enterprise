import { getSpiderChartData, prepareSpiderChartData } from '../utils';

export default function usePlotlySpiderChart(categories) {
  if (!categories) {
    return [];
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

  return [data, layout, config];
}
