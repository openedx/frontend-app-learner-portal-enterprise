import React, {
  useEffect, useState, useContext, useMemo,
} from 'react';
import { Card, Badge, StatusAlert } from '@edx/paragon';
import {
  SearchContext,
} from '@edx/frontend-enterprise-catalog-search';
import { Link } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

import Skeleton from 'react-loading-skeleton';
import Truncate from 'react-truncate';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearchMinus } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { useSelectedSkillsAndJobSkills } from './data/hooks';
import { SkillsContext } from './SkillsContextProvider';
import { ELLIPSIS_STR } from '../course/data/constants';
import { UserSubsidyContext } from '../enterprise-user-subsidy';
import { useDefaultSearchFilters } from '../search/data/hooks';
import getCommonSkills, { linkToCourse } from './data/utils';
import {
  HITS_PER_PAGE,
  MAX_VISIBLE_SKILLS_COURSE,
  NO_COURSES_ALERT_MESSAGE_AGAINST_SKILLS,
  SKILL_NAME_CUTOFF_LIMIT,
} from './constants';
import { shortenString } from '../course/data/utils';
import { isDefinedAndNotNull } from '../../utils/common';
import CardLoadingSkeleton from './CardLoadingSkeleton';

const renderDialog = () => (
  <div className="lead d-flex align-items-center py-3">
    <div className="mr-3">
      <FontAwesomeIcon icon={faSearchMinus} size="2x" />
    </div>
    <p>
      { NO_COURSES_ALERT_MESSAGE_AGAINST_SKILLS }
    </p>
  </div>
);

const SkillsCourses = ({ index }) => {
  const { enterpriseConfig } = useContext(AppContext);
  const { slug, uuid } = enterpriseConfig;
  const { state } = useContext(SkillsContext);
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [hitCount, setHitCount] = useState(undefined);
  const { refinements } = useContext(SearchContext);
  const { skill_names: skills } = refinements;
  const { selectedJob } = state;
  const allSkills = useSelectedSkillsAndJobSkills({ getAllSkills: true });

  const { subscriptionPlan, subscriptionLicense, offers: { offers } } = useContext(UserSubsidyContext);
  const offerCatalogs = offers.map((offer) => offer.catalog);

  const { filters } = useDefaultSearchFilters({
    enterpriseConfig,
    subscriptionPlan,
    subscriptionLicense,
    offerCatalogs,
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
      let fetch = true;
      fetchCourses(); // eslint-disable-line no-use-before-define
      return () => {
        fetch = false;
      };

      async function fetchCourses() {
        setIsLoading(true);
        const { hits, nbHits } = await index.search('', {
          hitsPerPage: HITS_PER_PAGE,
          filters: `content_type:course AND ${filters}`, // eslint-disable-line object-shorthand
          facetFilters: [
            skillsFacetFilter,
          ],
        });
        if (!fetch) {
          return;
        }
        if (nbHits > 0) {
          setCourses(camelCaseObject(hits));
          setHitCount(nbHits);
          setIsLoading(false);
        } else {
          setHitCount(nbHits);
          setIsLoading(false);
        }
      }
    },
    [selectedJob, skills],
  );
  const skillsWithSignificanceOrder = useSelectedSkillsAndJobSkills(
    { getAllSkills: false, getAllSkillsWithSignificanceOrder: true },
  );
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
    return coursesWithSkill;
  }, [skillsWithSignificanceOrder]);

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
    <div style={{ paddingLeft: '15%' }}>
      {hitCount > 0 && <h3>Skills</h3>}
      <div className="skills-badge">
        {isLoading ? <Badge as={Skeleton} width={100} count={6} className="course-skill" variant="top" duration={0} height={25} />
          : coursesWithSkills?.map(coursesWithSkill => (
            <Badge
              as={Link}
              to={`/${enterpriseConfig.slug}/search?skill_names=${coursesWithSkill.key}`}
              key={coursesWithSkill.key}
              className="course-skill"
              variant="light"
            >
              {coursesWithSkill.key}
            </Badge>
          )) }
      </div>
      {isLoading ? <CardLoadingSkeleton /> : coursesWithSkills?.map((coursesWithSkill) => (
        <>
          <h3> Top courses in {coursesWithSkill.key}</h3>
          <div className="row col col-12 p-0">
            <div className="skill-quiz-results align-items-l-between col col-xl-10">
              {coursesWithSkill?.value.map((course) => (
                <div
                  className="search-result-card mb-4"
                  role="group"
                  aria-label={course.title}
                  key={course.title}
                >
                  {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                  <Link to={isLoading ? '#' : linkToCourse(course, slug, uuid)}>
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
                          src={course.cardImageUrl}
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
                            src={partnerDetails[course.key].primaryPartner.logoImageUrl}
                            className="partner-logo"
                            alt={partnerDetails[course.key].primaryPartner.name}
                          />
                        </div>
                      )}
                      <Card.Body>
                        <Card.Title as="h4" className="card-title mb-2">
                          {isLoading ? (
                            <Skeleton count={2} data-testid="course-title-loading" />
                          ) : (
                            <Truncate lines={course.skillNames?.length < 5 ? 3 : 2} trimWhitespace>
                              {course.title}
                            </Truncate>
                          )}
                        </Card.Title>
                        {isLoading ? (
                          <Skeleton duration={0} data-testid="partner-name-loading" />
                        ) : (
                          <>
                            {course.partners.length > 0 && (
                              <p className="partner text-muted m-0">
                                <Truncate lines={2} trimWhitespace>
                                  {course.partners.map(partner => partner.name)
                                    .join(', ')}
                                </Truncate>
                              </p>
                            )}
                          </>
                        )}
                        {isLoading ? (
                          <Skeleton count={1} data-testid="skills-loading" />
                        ) : (
                          <>
                            {course.skillNames?.length > 0 && (
                              <div className="mb-2 d-inline">
                                {getCommonSkills(course, allSkills, MAX_VISIBLE_SKILLS_COURSE)
                                  .map((skill) => (
                                    <Badge
                                      key={skill}
                                      className="skill-badge"
                                      variant="light"
                                    >
                                      {shortenString(skill, SKILL_NAME_CUTOFF_LIMIT, ELLIPSIS_STR)}
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
            <Link
              className="more-courses-link col col-2 text-muted"
              to={`/${enterpriseConfig.slug}/search?skill_names=${coursesWithSkill.key}`}
            >
              See more courses
            </Link>
          </div>
        </>
      ))}
      <div>
        { hitCount === 0 && (
          <StatusAlert
            className="mt-4 mb-5"
            alertType="info"
            dialog={renderDialog()}
            dismissible={false}
            open
          />
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
