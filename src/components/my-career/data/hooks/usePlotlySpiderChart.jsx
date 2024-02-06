import { useEffect } from 'react';
import loadable from '@loadable/component';
import { getSpiderChartData, prepareSpiderChartData } from '../utils';

const Plotly = loadable.lib(() => import('plotly.js-dist').then(PlotlyLib => ({
  default: PlotlyLib.newPlot,
})));

// import Plotly from 'plotly.js-dist';

export default function usePlotlySpiderChart(categories) {
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

    const [data, layout, config] = getSpiderChartData(
      jobName,
      topCategories,
      averageScores,
      learnerScores,
    );
    return (
      <Plotly
        plotId="skill-levels-spider"
        data={data}
        layout={layout}
        config={config}
      />
    );
    // Plotly.newPlot('skill-levels-spider', data, layout, config);
  }, [categories]);
}
