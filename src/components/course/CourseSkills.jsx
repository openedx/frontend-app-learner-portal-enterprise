import React, { useContext, useState } from 'react';
import { Badge, Button } from '@edx/paragon';

import { CourseContext } from './CourseContextProvider';
import { SKILLS_BUTTON_LABEL } from './data/constants';

export const MAX_VISIBLE_SKILLS = 5;

export default function CourseSkills() {
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
