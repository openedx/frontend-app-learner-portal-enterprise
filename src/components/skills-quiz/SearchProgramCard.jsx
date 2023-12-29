import React, {
  useContext, useMemo, useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { useHistory } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import {
  Badge, Card, Icon, Alert, CardGrid, Stack, Truncate,
} from '@openedx/paragon';
import { Program, ZoomOut } from '@openedx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import cardFallbackImg from '@edx/brand/paragon/images/card-imagecap-fallback.png';
import { SkillsContext } from './SkillsContextProvider';
import { isDefinedAndNotNull, getPrimaryPartnerLogo } from '../../utils/common';
import { ELLIPSIS_STR } from '../course/data/constants';
import { shortenString } from '../course/data/utils';
import { SKILL_NAME_CUTOFF_LIMIT, MAX_VISIBLE_SKILLS_PROGRAM, NO_PROGRAMS_ALERT_MESSAGE } from './constants';
import getCommonSkills from './data/utils';
import { useSelectedSkillsAndJobSkills } from './data/hooks';
import { useDefaultSearchFilters, useSearchCatalogs } from '../search/data/hooks';
import { ProgramType } from '../search/SearchProgramCard';
import { UserSubsidyContext } from '../enterprise-user-subsidy';
import { SubsidyRequestsContext } from '../enterprise-subsidy-requests';

const linkToProgram = (program, slug, enterpriseUUID, programUuid) => {
  if (!Object.keys(program).length) {
    return '#';
  }
  return `/${slug}/program/${programUuid}`;
};

const SearchProgramCard = ({ index }) => {
  const history = useHistory();
  const { enterpriseConfig } = useContext(AppContext);
  const { slug, uuid } = enterpriseConfig;
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
    [selectedJobSkills],
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
    [filters, index, selectedJob, skills, skillsFacetFilter],
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
    [programs],
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
    [programs],
  );

  const getProgramCourseCount = (program) => {
    const numCourses = program.courseKeys?.length || 0;
    if (!numCourses) {
      return undefined;
    }
    return `${numCourses} ${numCourses > 1 ? 'Courses' : 'Course'}`;
  };

  const handleCardClick = (program) => {
    if (isLoading) {
      return;
    }
    const url = linkToProgram(program, slug, uuid, programUuids[program.aggregationKey].uuid);
    const { userId } = getAuthenticatedUser();
    sendEnterpriseTrackEvent(
      uuid,
      'edx.ui.enterprise.learner_portal.skills_quiz.program.clicked',
      {
        userId,
        programUuid: programUuids[program.aggregationKey].uuid,
      },
    );
    history.push(url);
  };

  if (hitCount === 0) {
    return (
      <Alert
        className="mt-4 mb-5"
        variant="info"
        dismissible={false}
        icon={ZoomOut}
        show
      >
        { NO_PROGRAMS_ALERT_MESSAGE }
      </Alert>
    );
  }

  return (
    <div>
      <h3 className="mb-3">Get started with these programs</h3>
      <CardGrid>
        {programs.map(program => {
          const primaryPartnerLogo = getPrimaryPartnerLogo(partnerDetails[program.aggregationKey]);
          return (
            <Card
              key={uuidv4()}
              isClickable
              isLoading={isLoading}
              onClick={() => handleCardClick(program)}
              variant="dark"
              data-testid="search-program-card"
            >
              <Card.ImageCap
                src={program.cardImageUrl || cardFallbackImg}
                fallbackSrc={cardFallbackImg}
                srcAlt=""
                logoSrc={primaryPartnerLogo?.src}
                logoAlt={primaryPartnerLogo?.alt}
              />
              <Card.Header
                title={(
                  <Truncate maxLine={3}>
                    {program.title}
                  </Truncate>
                )}
                subtitle={program.authoringOrganizations?.length > 0 && (
                  <Truncate maxLine={2}>
                    {program.authoringOrganizations.map(org => org.key).join(', ')}
                  </Truncate>
                )}
              />
              <Card.Section>
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                  {program.skillNames?.length > 0
                    && getCommonSkills(program, selectedJobSkills, MAX_VISIBLE_SKILLS_PROGRAM).map((skill) => (
                      <Badge key={skill} variant="light">
                        {shortenString(skill, SKILL_NAME_CUTOFF_LIMIT, ELLIPSIS_STR)}
                      </Badge>
                    ))}
                </Stack>
              </Card.Section>
              <Card.Section>
                <Badge
                  variant="light"
                  className="text-primary-500"
                  data-testid="program-type-badge"
                >
                  <div className="d-flex align-items-center">
                    <Icon src={Program} className="mr-1" />
                    <ProgramType type={program.type || null} />
                  </div>
                </Badge>
              </Card.Section>
              <Card.Footer
                textElement={<span>{getProgramCourseCount(program)}</span>}
              />
            </Card>
          );
        })}
      </CardGrid>
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
