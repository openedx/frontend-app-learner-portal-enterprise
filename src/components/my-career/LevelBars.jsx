import React from 'react';
import PropTypes from 'prop-types';
import { Chip } from '@openedx/paragon';

const LevelBars = ({ skillLevel }) => {
  let level = skillLevel;
  if (!level || level < 0) {
    level = 0;
  }
  if (level > 3) {
    level = 3;
  }

  const renderLevelBars = () => {
    const levelBars = [];
    for (let i = 3; i >= 1; i -= 1) {
      if (i > level) {
        levelBars.push(<Chip className="level-bar" data-testid="level-bar" label="" key={i} variant="light" />);
      } else {
        levelBars.push(<Chip className="level-bar bg-dark" data-testid="level-bar" label="" key={i} variant="dark" />);
      }
    }
    return levelBars;
  };

  return (
    <div className="level-bars" data-testid="level-bars">
      {
        renderLevelBars().map((levelBar) => levelBar)
      }
    </div>
  );
};

LevelBars.propTypes = {
  skillLevel: PropTypes.number.isRequired,
};

export default LevelBars;
