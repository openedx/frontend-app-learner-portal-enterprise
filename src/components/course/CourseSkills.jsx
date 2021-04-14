import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button } from '@edx/paragon';

import { AppContext } from '@edx/frontend-platform/react';
import { CourseContext } from './CourseContextProvider';
import { SKILLS_BUTTON_LABEL } from './data/constants';

export const MAX_VISIBLE_SKILLS = 5;

export default function CourseSkills() {
  const { enterpriseConfig } = useContext(AppContext);
  const { state } = useContext(CourseContext);
  const { skillNames } = state.course;
  const [showMore, setShowMore] = useState(false);
  const skillsButtonLabel = showMore ? SKILLS_BUTTON_LABEL.SHOW_LESS : SKILLS_BUTTON_LABEL.SHOW_MORE;
  return (
    <div className="mb-5">
      <h5> Skills you&apos;ll gain</h5>
      <div>
        {skillNames.map((skill, index) => (
          <Badge
            as={Link}
            to={`/${enterpriseConfig.slug}/search?skill_names=${skill}`}
            key={skill.id}
            className="course-skill"
            variant="light"
            style={{ display: ((index < MAX_VISIBLE_SKILLS) || showMore) ? 'inline-block' : 'none' }}
          >
            { skill }
          </Badge>
        ))}
        {skillNames.length > MAX_VISIBLE_SKILLS && (
          <Button className="d-inline-block" variant="link" onClick={() => { setShowMore(!showMore); }}>
            { skillsButtonLabel }
          </Button>
        )}
      </div>
    </div>
  );
}
