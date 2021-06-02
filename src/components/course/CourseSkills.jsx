import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import {
  Badge, Button, OverlayTrigger, Popover,
} from '@edx/paragon';

import { AppContext } from '@edx/frontend-platform/react';
import { CourseContext } from './CourseContextProvider';
import { SKILLS_BUTTON_LABEL, SKILL_DESCRIPTION_PLACEHOLDER } from './data/constants';

export const MAX_VISIBLE_SKILLS = 5;

export default function CourseSkills() {
  const { enterpriseConfig } = useContext(AppContext);
  const { state } = useContext(CourseContext);
  const { skills } = state.course;
  const [showMore, setShowMore] = useState(false);
  const skillsButtonLabel = showMore ? SKILLS_BUTTON_LABEL.SHOW_LESS : SKILLS_BUTTON_LABEL.SHOW_MORE;
  return (
    <div className="mb-5">
      <h5> Skills you&apos;ll gain</h5>
      <div>
        {skills.map((skill, index) => (
          <OverlayTrigger
            trigger={['hover', 'focus']}
            key={skill.name}
            placement="top"
            overlay={(
              <Popover id="popover-positioned-top" style={{ maxWidth: 380 }}>
                <Popover.Title as="h5">{skill.name}</Popover.Title>
                <Popover.Content
                  className={classNames({ 'text-muted': !skill.description, 'font-italic': !skill.description })}
                >
                  { skill.description ? skill.description : SKILL_DESCRIPTION_PLACEHOLDER }
                </Popover.Content>
              </Popover>
            )}
          >
            <Badge
              as={Link}
              to={`/${enterpriseConfig.slug}/search?skill_names=${skill.name}`}
              key={skill.name}
              className="course-skill"
              variant="light"
              style={{ display: ((index < MAX_VISIBLE_SKILLS) || showMore) ? 'inline-block' : 'none' }}
            >
              { skill.name }
            </Badge>
          </OverlayTrigger>
        ))}
        {skills.length > MAX_VISIBLE_SKILLS && (
          <Button className="d-inline-block" variant="link" onClick={() => { setShowMore(!showMore); }}>
            { skillsButtonLabel }
          </Button>
        )}
      </div>
    </div>
  );
}
