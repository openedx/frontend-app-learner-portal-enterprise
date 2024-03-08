import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import {
  Badge, OverlayTrigger, Popover,
} from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { CourseContext } from './CourseContextProvider';
import {
  SKILL_DESCRIPTION_CUTOFF_LIMIT, ELLIPSIS_STR,
} from './data/constants';
import { shortenString } from './data/utils';

export const MAX_VISIBLE_SKILLS = 5;

const CourseSkills = () => {
  const { enterpriseConfig } = useContext(AppContext);
  const { state } = useContext(CourseContext);
  const { skills } = state.course;

  return (
    <div className="mb-5">
      <h5>
        <FormattedMessage
          id="enterprise.course.about.skills.section.title"
          defaultMessage="Skills you'll gain"
          description="Title for the section that lists the skills that a learner will gain from the course."
        />
      </h5>
      <div>
        {skills.map((skill, index) => (
          <OverlayTrigger
            trigger={['hover', 'focus']}
            key={skill.name}
            placement="top"
            overlay={(
              <Popover id="popover-positioned-top" style={{ maxWidth: 460 }}>
                <Popover.Title as="h5">{skill.name}</Popover.Title>
                <Popover.Content
                  className={classNames({ 'text-muted': !skill.description, 'font-italic': !skill.description })}
                >
                  {
                    skill.description ? shortenString(skill.description, SKILL_DESCRIPTION_CUTOFF_LIMIT, ELLIPSIS_STR)
                      : (
                        <FormattedMessage
                          id="enterprise.course.about.skills.section.skill.description.placeholder"
                          defaultMessage="No description available."
                          description="Placeholder text for the skill description when no description is available."
                        />
                      )
                  }
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
              style={{ display: index < MAX_VISIBLE_SKILLS ? 'inline-block' : 'none' }}
            >
              { skill.name }
            </Badge>
          </OverlayTrigger>
        ))}
      </div>
    </div>
  );
};

export default CourseSkills;
