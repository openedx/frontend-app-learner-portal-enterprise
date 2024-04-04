import React, {
  useEffect, useState, useContext, useMemo,
} from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Button,
  Badge,
  Alert,
  Skeleton,
  CardGrid,
} from '@openedx/paragon';
import {
  SearchContext,
} from '@edx/frontend-enterprise-catalog-search';
import { v4 as uuidv4 } from 'uuid';
import { Link } from 'react-router-dom';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { ZoomOut } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';

import { useSelectedSkillsAndJobSkills } from './data/hooks';
import { sortSkillsCoursesWithCourseCount } from './data/utils';
import { SkillsContext } from './SkillsContextProvider';
import {
  NO_COURSES_ALERT_MESSAGE_AGAINST_SKILLS,
} from './constants';
import CardLoadingSkeleton from './CardLoadingSkeleton';
import CourseCard from './CourseCard';
import { useDefaultSearchFilters, useEnterpriseCustomer } from '../app/data';

const SkillsCourses = ({ index }) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { state: { selectedJob } } = useContext(SkillsContext);
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [hitCount, setHitCount] = useState(undefined);
  const { refinements: { skill_names: skills } } = useContext(SearchContext);
  const allSkills = useSelectedSkillsAndJobSkills({ getAllSkills: true });
  const filters = useDefaultSearchFilters();

  const skillsFacetFilter = useMemo(
    () => {
      if (allSkills) {
        return allSkills.map((skill) => `skill_names:${skill}`);
      }
      return [];
    },
    [allSkills],
  );

  useEffect(
    () => {
      async function fetchCourses() {
        setIsLoading(true);
        const { hits, nbHits } = await index.search('', {
          filters: `content_type:course AND ${filters}`, // eslint-disable-line object-shorthand
          facetFilters: [
            skillsFacetFilter,
          ],
        });
        if (nbHits > 0) {
          setCourses(camelCaseObject(hits));
          setHitCount(nbHits);
          setIsLoading(false);
        } else {
          setHitCount(nbHits);
          setIsLoading(false);
        }
      }
      fetchCourses();
    },
    [selectedJob, skills, index, filters, skillsFacetFilter],
  );
  const skillsWithSignificanceOrder = useSelectedSkillsAndJobSkills({
    getAllSkills: false,
    getAllSkillsWithSignificanceOrder: true,
  });
  const coursesWithSkills = useMemo(() => {
    const coursesWithSkill = [];
    skillsWithSignificanceOrder.forEach((skill) => {
      const coursesWithCurrentSkill = courses.filter(course => course.skillNames.includes(skill.key))
        .slice(0, 3);
      if (coursesWithCurrentSkill.length > 0) {
        coursesWithSkill.push({
          key: skill.key,
          value: coursesWithCurrentSkill,
        });
      }
    });
    return sortSkillsCoursesWithCourseCount(coursesWithSkill);
  }, [courses, skillsWithSignificanceOrder]);

  return (
    <div className="mt-4">
      {hitCount > 0 && (
        <h3>
          <FormattedMessage
            id="enterprise.skills.quiz.v1.skills.page.heading"
            defaultMessage="Skills"
            description="Skills heading on skills quiz v1 page."
          />
        </h3>
      )}
      <div className="skills-badge">
        {isLoading ? (
          <div className="mb-3">
            <Skeleton count={2} height={25} />
          </div>
        ) : coursesWithSkills?.map(coursesWithSkill => (
          <Badge
            as={Link}
            to={`/${enterpriseCustomer.slug}/search?skill_names=${coursesWithSkill.key}`}
            key={coursesWithSkill.key}
            className="course-skill"
            variant="light"
          >
            {coursesWithSkill.key}
          </Badge>
        ))}
      </div>
      {isLoading ? (
        <CardLoadingSkeleton />
      ) : coursesWithSkills?.map((coursesWithSkill) => (
        <React.Fragment key={uuidv4()}>
          <div className="my-4 d-flex align-items-center justify-content-between">
            <h3 className="mb-0">
              <FormattedMessage
                id="enterprise.skills.quiz.v1.skills.page.top.courses.heading"
                defaultMessage="Top courses in {skill}"
                description="Heading indicating the top courses related to a specific skill on the skills quiz v1 page."
                values={{ skill: coursesWithSkill.key }}
              />
            </h3>
            <Button
              as={Link}
              to={`/${enterpriseCustomer.slug}/search?skill_names=${coursesWithSkill.key}`}
              variant="link"
              size="inline"
            >
              <FormattedMessage
                id="enterprise.skills.quiz.v1.skills.page.see.more.courses.button.label"
                defaultMessage="See more courses >"
                description="See more courses button label on the skills quiz v1 page."
                values={{ skill: coursesWithSkill.key }}
              />
            </Button>
          </div>
          <CardGrid>
            {coursesWithSkill?.value.map((course) => (
              <CourseCard
                isLoading={isLoading}
                course={course}
                allSkills={allSkills}
                key={uuidv4()}
              />
            ))}
          </CardGrid>
        </React.Fragment>
      ))}
      <div>
        { hitCount === 0 && (
          <Alert
            className="mt-4 mb-5"
            variant="info"
            dismissible={false}
            icon={ZoomOut}
            show
          >
            { NO_COURSES_ALERT_MESSAGE_AGAINST_SKILLS }
          </Alert>
        )}
      </div>
    </div>
  );
};

SkillsCourses.propTypes = {
  index: PropTypes.shape({
    appId: PropTypes.string,
    indexName: PropTypes.string,
    search: PropTypes.func.isRequired,
  }).isRequired,
};

export default SkillsCourses;
