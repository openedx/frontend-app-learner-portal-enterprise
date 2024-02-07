import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { usePlotlySpiderChart } from './data/hooks';

const SpiderChart = ({ categories }) => {
  const [data, layout, config] = usePlotlySpiderChart(categories);
  useEffect(() => {
    if (categories) {
      // Plotly.newPlot('skill-levels-spider', data, layout, config);
      import(
        /* webpackChunkName: "plotly" */
        'plotly.js-dist'
      ).then(
        Plotly => Plotly.newPlot('skill-levels-spider', data, layout, config),
      );
    }
  }, [categories, config, data, layout]);
  return <div id="skill-levels-spider" data-testid="skill-levels-spider" />;
};

SpiderChart.propTypes = {
  categories: PropTypes.objectOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      skillCategories: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number.isRequired,
          name: PropTypes.string.isRequired,
          skills: PropTypes.arrayOf(
            PropTypes.shape({
              id: PropTypes.number.isRequired,
              name: PropTypes.string.isRequired,
              level: PropTypes.number.isRequired,
            }),
          ).isRequired,
        }).isRequired,
      ),
    }),
  ).isRequired,
};

export default SpiderChart;
