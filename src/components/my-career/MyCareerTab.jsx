import PropTypes from 'prop-types';
import { hydrateAuthenticatedUser } from '@edx/frontend-platform/auth';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';

import VisualizeCareer from './VisualizeCareer';
import AddJobRole from './AddJobRole';

const MyCareerTab = ({ learnerCurrentJobID }) => {
  const onUpdatedUserProfile = async (updatedProfile) => {
    await hydrateAuthenticatedUser(updatedProfile.username);
  };

  return (
    <div>
      <SearchData>
        {!learnerCurrentJobID ? (
          <AddJobRole submitClickHandler={onUpdatedUserProfile} />
        ) : (
          <VisualizeCareer
            jobId={learnerCurrentJobID}
            submitClickHandler={onUpdatedUserProfile}
          />
        )}
      </SearchData>
    </div>
  );
};

MyCareerTab.propTypes = {
  learnerCurrentJobID: PropTypes.string,
};

MyCareerTab.defaultProps = {
  learnerCurrentJobID: undefined,
};

export default MyCareerTab;
