import React, {
  useContext, useMemo, useState, useEffect,
} from 'react';
import qs from 'query-string';
import PropTypes from 'prop-types';
import Truncate from 'react-truncate';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { AppContext } from '@edx/frontend-platform/react';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { Badge, Card } from '@edx/paragon';
import { SkillsContext } from './SkillsContextProvider';

import { isDefinedAndNotNull } from '../../utils/common';
import { ELLIPSIS_STR } from '../course/data/constants';
import { shortenString } from '../course/data/utils';
import { SKILL_NAME_CUTOFF_LIMIT, MAX_VISIBLE_SKILLS_CARD } from './constants';
import { useSelectedSkillsAndJobSkills } from './data/hooks';

const getCourseSkills = (course) => (
  course.skill_names?.length > 0 ? course.skill_names.slice(0, MAX_VISIBLE_SKILLS_CARD) : null
);

const linkToCourse = (course, slug) => {
  if (!Object.keys(course).length) {
    return '#';
  }
  const queryParams = {
    queryId: course.queryId,
    objectId: course.objectId,
  };
  return `/${slug}/course/${course.key}?${qs.stringify(queryParams)}`;
};

const SearchCourseCard = ({ index }) => {
  const { enterpriseConfig: { slug } } = useContext(AppContext);
  const { state } = useContext(SkillsContext);
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const { refinements } = useContext(SearchContext);
  const { skill_names: skills } = refinements;
  const { selectedJob } = state;
  const selectedSkillsAndJobSkills = useSelectedSkillsAndJobSkills();
  const skillsFacetFilter = useMemo(
    () => {
      if (selectedSkillsAndJobSkills) {
        return selectedSkillsAndJobSkills.map((skill) => `skill_names:${skill}`);
      }
      return [];
    },
    [selectedJob],
  );
  useEffect(
    () => {
      let fetch = true;
      fetchCourses(); // eslint-disable-line no-use-before-define
      return () => { fetch = false; };

      async function fetchCourses() {
        setIsLoading(true);
        const { hits } = await index.search('', {
          facetFilters: [
            skillsFacetFilter,
          ],
        });
        if (!fetch) { return; }
        setCourses(hits.length <= 3 ? hits : hits.slice(0, 3));
        setIsLoading(false);
      }
    },
    [selectedJob, skills],
  );

  const partnerDetails = useMemo(
    () => {
      const partners = {};
      courses.forEach((course) => {
        if (!Object.keys(course).length || !isDefinedAndNotNull(course.partners)) {
          partners[course.key] = {};
        }
        partners[course.key] = {
          primaryPartner: course.partners.length > 0 ? course.partners[0] : undefined,
          showPartnerLogo: course.partners.length === 1,
        };
      });
      return partners;
    },
    [JSON.stringify(courses)],
  );

  return (
    <div>
      <h3 className="mt-2 mb-2"> Recommended Courses </h3>
      <div className="course-results">
        {courses.map(course => (
          <div
            className="course-card-result mb-4"
            role="group"
            aria-label={course.title}
          >
            { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */ }
            <Link to={isLoading ? '#' : linkToCourse(course, slug)}>
              <Card>
                {isLoading ? (
                  <Card.Img
                    as={Skeleton}
                    variant="top"
                    duration={0}
                    height={100}
                    data-testid="card-img-loading"
                  />
                ) : (
                  <Card.Img
                    variant="top"
                    src={course.card_image_url}
                    alt=""
                  />
                )}
                {isLoading && (
                  <div className="partner-logo-wrapper">
                    <Skeleton width={90} height={42} data-testid="partner-logo-loading" />
                  </div>
                )}
                {(!isLoading
                  && partnerDetails[course.key].primaryPartner && partnerDetails[course.key].showPartnerLogo) && (
                  <div className="partner-logo-wrapper">
                    <img
                      src={partnerDetails[course.key].primaryPartner.logo_image_url}
                      className="partner-logo"
                      alt={partnerDetails[course.key].primaryPartner.name}
                    />
                  </div>
                )}
                <Card.Body>
                  <Card.Title as="h4" className="card-title mb-1">
                    {isLoading ? (
                      <Skeleton count={2} data-testid="course-title-loading" />
                    ) : (
                      <Truncate lines={course.skill_names?.length < 4 ? 3 : 2} trimWhitespace>
                        { course.title }
                      </Truncate>
                    )}
                  </Card.Title>
                  {isLoading ? (
                    <Skeleton duration={0} data-testid="partner-name-loading" />
                  ) : (
                    <>
                      {course.partners.length > 0 && (
                        <p className="partner text-muted m-0">
                          <Truncate lines={1} trimWhitespace>
                            {course.partners.map(partner => partner.name).join(', ')}
                          </Truncate>
                        </p>
                      )}
                    </>
                  )}
                  {isLoading ? (
                    <Skeleton count={1} data-testid="skills-loading" />
                  ) : (
                    <>
                      { course.skill_names?.length > 0 && (
                        <div className="mb-2 d-inline">
                          {getCourseSkills(course).map((skill) => (
                            <Badge
                              key={skill}
                              className="course-badge"
                              variant="light"
                            >
                              { shortenString(skill, SKILL_NAME_CUTOFF_LIMIT, ELLIPSIS_STR) }
                            </Badge>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </Card.Body>
              </Card>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

SearchCourseCard.propTypes = {
  index: PropTypes.shape({
    appId: PropTypes.string,
    indexName: PropTypes.string,
    search: PropTypes.func.isRequired,
  }).isRequired,
};

export default SearchCourseCard;
