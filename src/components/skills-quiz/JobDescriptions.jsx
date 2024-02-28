import PropTypes from 'prop-types';
import { InfoOutline } from '@openedx/paragon/icons';
import { Skeleton } from '@openedx/paragon';
import { useJobPathDescription } from './data/hooks';
import { DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE, JOB_DESCRIPTION_DISCLAIMER } from './constants';

const JobDescriptions = ({
  currentJobID, futureJobID, currentJobDescription, futureJobDescription, goal,
}) => {
  const [isLoadingJobPathDescription, jobPathDescription] = useJobPathDescription({ currentJobID, futureJobID, goal });
  const jobDescription = goal === DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE ? currentJobDescription : futureJobDescription;

  return (
    <div className="job-descriptions-container">
      <div className="disclaimer mb-3">
        <InfoOutline className="mr-1" style={{ width: '2rem', height: '2rem' }} />
        <span className="font-italic font-weight-light">{JOB_DESCRIPTION_DISCLAIMER}</span>
      </div>
      <div className="job-description mb-3">{jobDescription}</div>
      {isLoadingJobPathDescription ? <Skeleton count={3} containerTestId="loading-job-path-description" /> : <div className="job-path-description mb-3">{jobPathDescription}</div>}
    </div>
  );
};

JobDescriptions.propTypes = {
  currentJobID: PropTypes.string.isRequired,
  futureJobID: PropTypes.string.isRequired,
  currentJobDescription: PropTypes.string.isRequired,
  futureJobDescription: PropTypes.string.isRequired,
  goal: PropTypes.string.isRequired,
};

export default JobDescriptions;
