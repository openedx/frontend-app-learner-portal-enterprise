import { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Badge, Card, Skeleton } from '@openedx/paragon';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { getConfig } from '@edx/frontend-platform/config';
import { Configure, InstantSearch } from 'react-instantsearch-dom';
import { SkillsContext } from './SkillsContextProvider';
import { DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE } from './constants';
import SelectedJobSkills from './SelectedJobSkills';
import JobDescriptions from './JobDescriptions';
import { isObjEmpty, useAlgoliaSearch } from '../app/data';
import { AlgoliaFilterBuilder } from '../AlgoliaFilterBuilder';
import CardLoadingSkeleton from './CardLoadingSkeleton';
import { withCamelCasedStateResults } from '../utils/skills-quiz';
import SimilarJobs from './SimilarJobs';

const getJobSkills = (job) => {
  const jobSkills = job[0]?.skills?.sort((a, b) => (
    (a.significance < b.significance) ? 1 : -1));
  return jobSkills?.slice(0, 7);
};

const TopSkillsHits = ({ hits, isLoading }) => {
  const {
    state: {
      selectedJob, goal, currentJobRole, interestedJobs,
    },
  } = useContext(SkillsContext);

  const { refinements: { current_job: currentJob, industry_names: industryNames } } = useContext(SearchContext);
  const jobSelected = goal === DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE ? currentJobRole : interestedJobs;

  const selectedJobDetails = useMemo(
    () => jobSelected?.filter(job => job?.name === selectedJob) || [],
    [jobSelected, selectedJob],
  );

  const industrySkills = useMemo(
    () => {
      let industrySkillNames = [];
      if (industryNames?.length > 0 && selectedJobDetails.length > 0) {
        const industryName = industryNames[0];
        const industryDetails = selectedJobDetails[0]?.industries?.filter(industry => industry.name === industryName);
        industrySkillNames = industryDetails[0]?.skills;
      }
      return industrySkillNames;
    },
    [industryNames, selectedJobDetails],
  );

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

  return (
    <div className="mt-4 mb-4">
      <div className="col-12 skills-overview">
        <Card>
          <Card.Section>
            <div className="row job-heading">
              <h3>
                {
                  goal === DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE || !currentJob ? selectedJob
                    : `${ currentJob }  to ${selectedJob}`
                }
              </h3>
              { industryNames?.length > 0 && (
                <div>
                  <Badge
                    key="common"
                    className="common-badge"
                    variant="light"
                  >
                    common
                  </Badge>

                  <Badge
                    key="industry-specific"
                    className="industry-badge"
                    variant="dark"
                  >
                    industry-specific
                  </Badge>
                </div>
              )}
            </div>
          </Card.Section>
          <Card.Section>
            <div className="row skill-overview-body">
              {hits?.length > 0 && selectedJobDetails?.length > 0
                && (
                  <JobDescriptions
                    currentJobID={hits[0].externalId}
                    futureJobID={selectedJobDetails[0].externalId}
                    currentJobDescription={hits[0].description}
                    futureJobDescription={selectedJobDetails[0].description}
                    goal={goal}
                  />
                )}
              { selectedJob && (
                <div
                  className={goal !== DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE && currentJob?.length > 0 ? 'col-6' : 'full-max-width'}
                >
                  <SelectedJobSkills
                    heading={`Top Skills for ${selectedJob}`}
                    skills={getJobSkills(selectedJobDetails)}
                    industrySkills={industrySkills}
                  />
                </div>
              ) }
              {goal !== DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE
                && currentJob
                && currentJob?.length !== 0
                && hits
                && (
                  <div className="col-6">
                    <SelectedJobSkills
                      heading={`Skills you might already have as a ${currentJob}`}
                      skills={getJobSkills(hits)}
                      industrySkills={industrySkills}
                    />
                  </div>
                )}
              <div className="similar-jobs-section">
                {!isObjEmpty(selectedJobDetails) && <SimilarJobs selectedJobDetails={selectedJobDetails} />}
              </div>
            </div>
          </Card.Section>
        </Card>
      </div>
    </div>
  );
};

const ConnectTopSkillsHits = withCamelCasedStateResults(TopSkillsHits);

TopSkillsHits.propTypes = {
  isLoading: PropTypes.bool,
  hits: PropTypes.arrayOf(PropTypes.shape()),
};

const TopSkillsOverview = () => {
  const config = getConfig();
  const {
    searchIndex: jobIndex,
    searchClient: jobSearchClient,
  } = useAlgoliaSearch(config.ALGOLIA_INDEX_NAME_JOBS);
  const { refinements: { current_job: currentJob } } = useContext(SearchContext);

  const searchFilters = useMemo(() => {
    if (currentJob?.length) {
      return new AlgoliaFilterBuilder()
        .and('name', currentJob[0], true)
        .build();
    }
    return '';
  }, [currentJob]);
  return (
    <InstantSearch
      indexName={jobIndex.indexName}
      searchClient={jobSearchClient}
    >
      <Configure filters={searchFilters} hitsPerPage={3} />
      <ConnectTopSkillsHits />
    </InstantSearch>
  );
};

export default TopSkillsOverview;
