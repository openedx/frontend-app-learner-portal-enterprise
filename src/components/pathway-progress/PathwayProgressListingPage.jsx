import React, {
  useContext,
} from 'react';
import {
  Row,
  Container,
  Button,
} from '@edx/paragon';
import { AppContext, ErrorPage } from '@edx/frontend-platform/react';
import './styles/index.scss';

import { Search } from '@edx/paragon/icons';

import { Link } from 'react-router-dom';
import { LoadingSpinner } from '../loading-spinner';

import { useInProgressPathwaysData } from './data/hooks';
import { NO_PATHWAYS_ERROR_MESSAGE } from './constants';
import PathwayProgressCard from './PathwayProgressCard';

import { CONTENT_TYPE_PATHWAY } from '../search/constants';

const PathwayProgressListingPage = () => {
  const { enterpriseConfig } = useContext(AppContext);

  const [pathwayProgressData, fetchError] = useInProgressPathwaysData(enterpriseConfig.uuid);

  if (fetchError) {
    return <ErrorPage message={fetchError.message} />;
  }

  if (!pathwayProgressData) {
    return (
      <Container size="lg" className="py-5">
        <LoadingSpinner screenReaderText="loading pathways" />
      </Container>
    );
  }

  return (
    <>
      <Container size="lg" className="py-5 w-100">
        <Row>
          {pathwayProgressData?.length > 0 ? (
            pathwayProgressData.map((pathway) => (
              <PathwayProgressCard
                pathway={pathway}
                key={pathway.learnerPathwayProgress.uuid}
              />
            ))
          ) : (
            <div className="no-content-message">
              <h2>{NO_PATHWAYS_ERROR_MESSAGE}</h2>
              <Link to={`/${enterpriseConfig.slug}/search?content_type=${CONTENT_TYPE_PATHWAY}`}>
                <Button variant="primary" iconBefore={Search} className="btn-brand-primary mt-2">Explore pathways</Button>
              </Link>
            </div>
          )}
        </Row>
      </Container>
    </>
  );
};

export default PathwayProgressListingPage;
