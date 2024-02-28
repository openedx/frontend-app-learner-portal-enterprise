import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Badge } from '@openedx/paragon';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';

const SelectedJobSkills = ({ heading, skills, industrySkills }) => {
  const { refinements: { industry_names: industryNames } } = useContext(SearchContext);

  return (
    <div>
      <h4> {heading} </h4>
      <div className="d-flex flex-wrap">
        {skills?.map(skill => (
          <Badge
            key={skill.name}
            className="skill-badge"
            variant={industryNames?.length > 0 && industrySkills?.includes(skill.name) ? 'dark' : 'light'}
            data-testid="top-skills-badge"
          >
            {skill.name}
          </Badge>
        ))}
      </div>
    </div>
  );
};

SelectedJobSkills.propTypes = {
  heading: PropTypes.string.isRequired,
  skills: PropTypes.arrayOf(PropTypes.string).isRequired,
  industrySkills: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default SelectedJobSkills;
