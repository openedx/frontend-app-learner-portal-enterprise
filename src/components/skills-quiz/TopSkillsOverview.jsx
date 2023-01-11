import React, { useContext } from 'react';
import { Badge, Card } from '@edx/paragon';
import { SkillsContext } from './SkillsContextProvider';
import { DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE } from './constants';
import SelectedJobSkills from './SelectedJobSkills';

const TopSkillsOverview = () => {

  return (
    <div className="mb-2 mt-2">
      <div className="col-12" style={{maxWidth:'92%'}}>
        <Card>
        <Card.Section >
          <div className="row">
            <h4>Data Analyst to Backend Software Engineer</h4>
            <Badge
              key={`skill.name`}
              className="skill-badge"
              variant="light"
              style={{ fontWeight:500 }}
            >
            { `skill.name` }
            </Badge>
          </div>
        </Card.Section>
          <Card.Section >
          <div className="row">
            <div className="col-6" >
              <SelectedJobSkills/>
            </div>
            <div className="col-6">
              <SelectedJobSkills/>
            </div>
          </div>
          </Card.Section>
        </Card>
      </div>
    </div>
  );
};

export default TopSkillsOverview;
