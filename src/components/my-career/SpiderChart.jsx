import React from 'react';

import PropTypes from 'prop-types';
import { usePlotlySpiderChart } from './data/hooks';

const SpiderChart = ({ categories }) => {
  usePlotlySpiderChart(categories);

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
