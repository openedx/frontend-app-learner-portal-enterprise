import { Fragment, useMemo } from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Alert, Badge, Button, CardGrid, Skeleton,
} from '@openedx/paragon';
import { v4 as uuidv4 } from 'uuid';
import { Link } from 'react-router-dom';
import { ZoomOut } from '@openedx/paragon/icons';

import { Configure, InstantSearch } from 'react-instantsearch-dom';
import PropTypes from 'prop-types';
import { useSelectedSkillsAndJobSkills } from './data/hooks';
import { sortSkillsCoursesWithCourseCount } from './data/utils';
import { NO_COURSES_ALERT_MESSAGE_AGAINST_SKILLS } from './constants';
import CourseCard from './CourseCard';
import {
  useAlgoliaSearch, useContentTypeFilter, useDefaultSearchFilters, useEnterpriseCustomer,
} from '../app/data';
import { AlgoliaFilterBuilder } from '../AlgoliaFilterBuilder';
import CardLoadingSkeleton from './CardLoadingSkeleton';

import { withCamelCasedStateResults } from '../../utils/HOC';

const SkillsHits = ({ hits, isLoading }) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const skillsWithSignificanceOrder = useSelectedSkillsAndJobSkills({
    getAllSkills: false,
    getAllSkillsWithSignificanceOrder: true,
  });

  const coursesWithSkills = useMemo(() => {
    const grouped = [];
    skillsWithSignificanceOrder.forEach(skill => {
      const matching = hits.filter(h => h.skillNames?.includes(skill.key)).slice(0, 3);
      if (matching.length > 0) {
        grouped.push({ key: skill.key, value: matching });
      }
    });
    return sortSkillsCoursesWithCourseCount(grouped);
  }, [hits, skillsWithSignificanceOrder]);

  if (isLoading) {
    return (
      <>
        <div className="mt-4">
          <div className="skills-badge">
            <div className="mb-3">
              <Skeleton count={2} height={25} />
            </div>
          </div>
        </div>
        <CardLoadingSkeleton />
      </>
    );
  }

  if (!hits?.length) {
    return (
      <Alert
        className="mt-4 mb-5"
        variant="info"
        dismissible={false}
        icon={ZoomOut}
        show
      >
        { NO_COURSES_ALERT_MESSAGE_AGAINST_SKILLS }
      </Alert>
    );
  }

  return (
    <>
      <div className="mt-4">
        <h3>
          <FormattedMessage
            id="enterprise.skills.quiz.v1.skills.page.heading"
            defaultMessage="Skills"
            description="Skills heading on skills quiz v1 page."
          />
        </h3>
        <div className="skills-badge">
          {coursesWithSkills.map(cs => (
            <Badge
              key={cs.key}
              to={`/${enterpriseCustomer.slug}/search?skill_names=${cs.key}`}
              as={Link}
              className="course-skill"
              variant="light"
            >
              {cs.key}
            </Badge>
          ))}
        </div>
      </div>
      {coursesWithSkills.map(cs => (
        <Fragment key={uuidv4()}>
          <div className="my-4 d-flex align-items-center justify-content-between">
            <h3 className="mb-0">
              <FormattedMessage
                id="enterprise.skills.quiz.v1.skills.page.top.courses.heading"
                defaultMessage="Top courses in {skill}"
                values={{ skill: cs.key }}
              />
            </h3>
            <Button
              as={Link}
              to={`/${enterpriseCustomer.slug}/search?skill_names=${cs.key}`}
              variant="link"
              size="inline"
            >
              <FormattedMessage
                id="enterprise.skills.quiz.v1.skills.page.see.more.courses.button.label"
                defaultMessage="See more courses >"
                description="See more courses button label on the skills quiz v1 page."
                values={{ skill: cs.key }}
              />
            </Button>
          </div>
          <CardGrid>
            {cs.value.map(course => (
              <CourseCard key={uuidv4()} course={course} isLoading={isLoading} />
            ))}
          </CardGrid>
        </Fragment>
      ))}
    </>
  );
};

const ConnectedSkillsHits = withCamelCasedStateResults(SkillsHits);

SkillsHits.propTypes = {
  isLoading: PropTypes.bool,
  hits: PropTypes.arrayOf(PropTypes.shape()),
};

const SkillsCourses = () => {
  const { searchIndex, searchClient } = useAlgoliaSearch();
  const allSkills = useSelectedSkillsAndJobSkills({ getAllSkills: true });
  const filters = useDefaultSearchFilters();
  const {
    courseFilter,
  } = useContentTypeFilter({ filter: filters });
  const searchFilters = useMemo(() => new AlgoliaFilterBuilder()
    .andRaw(courseFilter)
    .or('skill_names', allSkills, { stringify: true })
    .build(), [courseFilter, allSkills]);

  return (
    <InstantSearch indexName={searchIndex.indexName} searchClient={searchClient}>
      <Configure filters={searchFilters} />
      <ConnectedSkillsHits />
    </InstantSearch>

  );
};

export default SkillsCourses;
