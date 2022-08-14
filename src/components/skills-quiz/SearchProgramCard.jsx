import React, {
  useContext, useMemo, useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import Truncate from 'react-truncate';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { AppContext } from '@edx/frontend-platform/react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import {
  Badge, Card, Icon, StatusAlert,
} from '@edx/paragon';
import { Program } from '@edx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearchMinus } from '@fortawesome/free-solid-svg-icons';
import { SkillsContext } from './SkillsContextProvider';
import { isDefinedAndNotNull } from '../../utils/common';
import { ELLIPSIS_STR } from '../course/data/constants';
import { shortenString } from '../course/data/utils';
import { SKILL_NAME_CUTOFF_LIMIT, MAX_VISIBLE_SKILLS_PROGRAM, NO_PROGRAMS_ALERT_MESSAGE } from './constants';
import getCommonSkills from './data/utils';
import { useSelectedSkillsAndJobSkills } from './data/hooks';
import { useDefaultSearchFilters } from '../search/data/hooks';
import { ProgramType } from '../search/SearchProgramCard';
import { UserSubsidyContext } from '../enterprise-user-subsidy';

const linkToProgram = (program, slug, enterpriseUUID, programUuid) => {
  if (!Object.keys(program).length) {
    return '#';
  }
  const { userId } = getAuthenticatedUser();
  sendEnterpriseTrackEvent(
    enterpriseUUID,
    'edx.ui.enterprise.learner_portal.search.program.card.clicked',
    {
      userId,
      programUuid,
    },
  );
  return `/${slug}/program/${programUuid}`;
};

const renderDialog = () => (
  <div className="lead d-flex align-items-center py-3">
    <div className="mr-3">
      <FontAwesomeIcon icon={faSearchMinus} size="2x" />
    </div>
    <p>
      { NO_PROGRAMS_ALERT_MESSAGE }
    </p>
  </div>
);

const SearchProgramCard = ({ index }) => {
  const { enterpriseConfig } = useContext(AppContext);
  const { slug, uuid } = enterpriseConfig;
  const { subscriptionPlan, offers: { offers } } = useContext(UserSubsidyContext);
  const offerCatalogs = offers.map((offer) => offer.catalog);
  const { filters } = useDefaultSearchFilters({
    enterpriseConfig,
    subscriptionPlan,
    offerCatalogs,
  });
  const { state } = useContext(SkillsContext);
  const [isLoading, setIsLoading] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [hitCount, setHitCount] = useState(undefined);
  const { refinements } = useContext(SearchContext);
  const { skill_names: skills } = refinements;
  const { selectedJob } = state;
  // Top 3 recommended programs are determined based on job-skills only, coming either from Search Job or Current Job
  const selectedJobSkills = useSelectedSkillsAndJobSkills({ getAllSkills: false });
  const skillsFacetFilter = useMemo(
    () => {
      if (selectedJobSkills) {
        return selectedJobSkills.map((skill) => `skill_names:${skill}`);
      }
      return [];
    },
    [selectedJob],
  );
  useEffect(
    () => {
      let fetch = true;
      fetchPrograms(); // eslint-disable-line no-use-before-define
      return () => { fetch = false; };

      async function fetchPrograms() {
        setIsLoading(true);
        const { hits, nbHits } = await index.search('', {
          filters: `content_type:program AND ${filters}`, // eslint-disable-line object-shorthand
          facetFilters: [
            skillsFacetFilter,
          ],
        });
        if (!fetch) { return; }
        if (nbHits > 0) {
          setPrograms(hits.length <= 3 ? camelCaseObject(hits) : camelCaseObject(hits.slice(0, 3)));
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

  const partnerDetails = useMemo(
    () => {
      const partners = {};
      programs.forEach((program) => {
        if (!Object.keys(program).length || !isDefinedAndNotNull(program.authoringOrganizations)) {
          partners[program.aggregationKey] = {};
        }
        partners[program.aggregationKey] = {
          primaryPartner: program.authoringOrganizations?.length > 0 ? program.authoringOrganizations[0] : undefined,
          showPartnerLogo: program.authoringOrganizations?.length === 1,
        };
      });
      return partners;
    },
    [JSON.stringify(programs)],
  );

  const programUuids = useMemo(
    () => {
      const programUUIDs = {};
      programs.forEach((program) => {
        if (!Object.keys(program).length) {
          programUUIDs[program.aggregationKey] = undefined;
        }
        programUUIDs[program.aggregationKey] = {
          uuid: program.aggregationKey.split(':').pop(),
        };
      });
      return programUUIDs;
    },
    [JSON.stringify(programs)],
  );

  return (
    <div>
      {(hitCount > 0) ? <h3 className="mt-2 mb-2"> Get started with these programs </h3> : null}
      <div className="skill-quiz-results">
        {(hitCount > 0) && programs.map(program => (
          <div
            className="search-result-card mb-4"
            role="group"
            aria-label={program.title}
            key={program.title}
          >
            { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */ }
            <Link
              to={isLoading ? '#' : linkToProgram(program, slug, uuid, programUuids[program.aggregationKey].uuid)}
            >
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
                    src={program.cardImageUrl}
                    alt=""
                  />
                )}
                {isLoading && (
                  <div className="partner-logo-wrapper">
                    <Skeleton width={90} height={42} data-testid="partner-logo-loading" />
                  </div>
                )}
                {(!isLoading && partnerDetails[program.aggregationKey].primaryPartner
                  && partnerDetails[program.aggregationKey].showPartnerLogo) && (
                  <div className="partner-logo-wrapper">
                    <img
                      src={partnerDetails[program.aggregationKey].primaryPartner.logoImageUrl}
                      className="partner-logo"
                      alt={partnerDetails[program.aggregationKey].primaryPartner.name}
                    />
                  </div>
                )}
                <Card.Body>
                  <Card.Title as="h4" className="card-title mb-1">
                    {isLoading ? (
                      <Skeleton count={2} data-testid="program-title-loading" />
                    ) : (
                      <Truncate lines={2} trimWhitespace>
                        {program.title}
                      </Truncate>
                    )}
                  </Card.Title>
                  {isLoading ? (
                    <Skeleton duration={0} data-testid="partner-key-loading" />
                  ) : (
                    <>
                      {program.authoringOrganizations?.length > 0 && (
                        <p className="partner text-muted m-0">
                          <Truncate lines={1} trimWhitespace>
                            {program.authoringOrganizations.map(org => org.key).join(', ')}
                          </Truncate>
                        </p>
                      )}
                    </>
                  )}
                  {isLoading ? (
                    <Skeleton count={1} data-testid="skills-loading" />
                  ) : (
                    <>
                      { program.skillNames?.length > 0 && (
                        <div className="mb-2 d-inline">
                          {getCommonSkills(program, selectedJobSkills, MAX_VISIBLE_SKILLS_PROGRAM).map((skill) => (
                            <Badge
                              key={skill}
                              className="skill-badge"
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
                <Card.Footer className="bg-white border-0 pt-0 pb-2 pl-2.5">
                  {isLoading ? (
                    <Skeleton duration={0} data-testid="program-type-loading" />
                  ) : (
                    <div className="d-flex">
                      <Badge
                        variant="light"
                        className={classNames(
                          'program-badge d-flex justify-content-center align-items-center text-primary-500',
                          { 'mb-2': program.courseKeys?.length > 1 },
                          { 'mb-4': program.courseKeys?.length <= 1 },
                        )}
                      >
                        <Icon src={Program} className="badge-icon" />
                        <span className="badge-text">
                          <ProgramType type={program.type} />
                        </span>
                      </Badge>
                    </div>
                  )}
                  {isLoading ? (
                    <Skeleton duration={0} data-testid="program-courses-count-loading" />
                  ) : (
                    <>
                      {program.courseKeys?.length > 0 && (
                        <span className="program-courses-count-text">{program.courseKeys.length} Courses</span>
                      )}
                    </>
                  )}
                </Card.Footer>
              </Card>
            </Link>
          </div>
        ))}
      </div>
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

SearchProgramCard.propTypes = {
  index: PropTypes.shape({
    appId: PropTypes.string,
    indexName: PropTypes.string,
    search: PropTypes.func.isRequired,
  }).isRequired,
};

export default SearchProgramCard;
