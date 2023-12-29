import React, {
  useContext, useEffect, useState, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { Badge, Card } from '@openedx/paragon';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { SkillsContext } from './SkillsContextProvider';
import { DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE } from './constants';
import SelectedJobSkills from './SelectedJobSkills';
import SimilarJobs from './SimilarJobs';
import JobDescriptions from './JobDescriptions';

const getJobSkills = (job) => {
  const jobSkills = job[0]?.skills?.sort((a, b) => (
    (a.significance < b.significance) ? 1 : -1));
  return jobSkills?.slice(0, 7);
};

const TopSkillsOverview = ({ index }) => {
  const {
    state: {
      selectedJob, goal, currentJobRole, interestedJobs,
    },
  } = useContext(SkillsContext);
  const { refinements: { current_job: currentJob, industry_names: industryNames } } = useContext(SearchContext);
  const [currentJobDetails, setCurrentJobDetails] = useState(null);
  const jobSelected = goal === DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE ? currentJobRole : interestedJobs;
  const selectedJobDetails = useMemo(
    () => jobSelected?.filter(job => job.name === selectedJob) || [],
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

  useEffect(
    () => {
      async function fetchJobDetails() {
        const { hits } = await index.search('', {
          facetFilters: [
            [`name:${currentJob}`],
          ],
        });
        if (hits.length > 0) {
          setCurrentJobDetails(hits);
        }
      }

      fetchJobDetails(); // eslint-disable-line no-use-before-define
    },
    [currentJob, index],
  );

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
              {currentJobDetails?.length > 0 && selectedJobDetails?.length > 0
                && (
                  <JobDescriptions
                    currentJobID={currentJobDetails[0].external_id}
                    futureJobID={selectedJobDetails[0].external_id}
                    currentJobDescription={currentJobDetails[0].description}
                    futureJobDescription={selectedJobDetails[0].description}
                    goal={goal}
                  />
                )}
              <div
                className={goal !== DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE && currentJob?.length > 0 ? 'col-6' : 'full-max-width'}
              >
                <SelectedJobSkills
                  heading={`Top Skills for ${selectedJob}`}
                  skills={getJobSkills(selectedJobDetails)}
                  industrySkills={industrySkills}
                />
              </div>
              {goal !== DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE && currentJob?.length !== 0 && currentJobDetails && (
                <div className="col-6">
                  <SelectedJobSkills
                    heading={`Skills you might already have as a ${currentJob}`}
                    skills={getJobSkills(currentJobDetails)}
                    industrySkills={industrySkills}
                  />
                </div>
              )}
              <div className="similar-jobs-section">
                <SimilarJobs selectedJobDetails={selectedJobDetails} index={index} />
              </div>
            </div>
          </Card.Section>
        </Card>
      </div>
    </div>
  );
};

TopSkillsOverview.propTypes = {
  index: PropTypes.shape({
    appId: PropTypes.string,
    indexName: PropTypes.string,
    search: PropTypes.func.isRequired,
  }).isRequired,
};

export default TopSkillsOverview;
