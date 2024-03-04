import React, {
  useEffect, useState, useContext, useMemo,
} from 'react';
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
import { AppContext } from '@edx/frontend-platform/react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { ZoomOut } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';

import { useSelectedSkillsAndJobSkills } from './data/hooks';
import { sortSkillsCoursesWithCourseCount } from './data/utils';
import { SkillsContext } from './SkillsContextProvider';
import { UserSubsidyContext } from '../enterprise-user-subsidy';
import { useDefaultSearchFilters, useSearchCatalogs } from '../search/data/hooks';
import {
  NO_COURSES_ALERT_MESSAGE_AGAINST_SKILLS,
} from './constants';
import CardLoadingSkeleton from './CardLoadingSkeleton';
import CourseCard from './CourseCard';
import { SubsidyRequestsContext } from '../enterprise-subsidy-requests';

const SkillsCourses = ({ index }) => {
  const { enterpriseConfig } = useContext(AppContext);
  const { state: { selectedJob } } = useContext(SkillsContext);
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [hitCount, setHitCount] = useState(undefined);
  const { refinements: { skill_names: skills } } = useContext(SearchContext);
  const allSkills = useSelectedSkillsAndJobSkills({ getAllSkills: true });

  const {
    subscriptionPlan,
    subscriptionLicense,
    couponCodes: { couponCodes },
    enterpriseOffers,
    redeemableLearnerCreditPolicies,
  } = useContext(UserSubsidyContext);
  const { catalogsForSubsidyRequests } = useContext(SubsidyRequestsContext);

  const searchCatalogs = useSearchCatalogs({
    subscriptionPlan,
    subscriptionLicense,
    couponCodes,
    enterpriseOffers,
    catalogsForSubsidyRequests,
    redeemableLearnerCreditPolicies,
  });

  const { filters } = useDefaultSearchFilters({
    enterpriseConfig,
    searchCatalogs,
  });

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
      {hitCount > 0 && <h3>Skills</h3>}
      <div className="skills-badge">
        {isLoading ? (
          <div className="mb-3">
            <Skeleton count={2} height={25} />
          </div>
        ) : coursesWithSkills?.map(coursesWithSkill => (
          <Badge
            as={Link}
            to={`/${enterpriseConfig.slug}/search?skill_names=${coursesWithSkill.key}`}
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
            <h3 className="mb-0">Top courses in {coursesWithSkill.key}</h3>
            <Button
              as={Link}
              to={`/${enterpriseConfig.slug}/search?skill_names=${coursesWithSkill.key}`}
              variant="link"
              size="inline"
            >
              See more courses &gt;
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
