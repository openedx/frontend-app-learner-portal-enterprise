import React, {
  useContext,
} from 'react';
import { Helmet } from 'react-helmet';
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

import { useLearnerProgramsListData } from './data/hooks';
import ProgramListingCard from './ProgramListingCard';

import { CONTENT_TYPE_PROGRAM } from '../search/constants';

const ProgramListing = () => {
  const { enterpriseConfig } = useContext(AppContext);

  const [learnerProgramsData, fetchError] = useLearnerProgramsListData(enterpriseConfig.uuid);

  if (fetchError) {
    return <ErrorPage message={fetchError.message} />;
  }

  if (!learnerProgramsData) {
    return (
      <Container size="lg" className="py-5">
        <LoadingSpinner screenReaderText="loading program" />
      </Container>
    );
  }

  return (
    <>
      <Helmet title={`Programs | ${enterpriseConfig.name}`} />
      <Container size="lg" className="py-5 w-75">
        <Row>
          {

            learnerProgramsData.length > 0
              ? learnerProgramsData.map((program) => <ProgramListingCard program={program} key={program.title} />)
              : (
                <div className="no-programs-message">
                  <h2>You are not enrolled in any programs yet.</h2>
                  <Link to={`/${enterpriseConfig.slug}/search?content_type=${CONTENT_TYPE_PROGRAM}`}>
                    <Button variant="primary" iconBefore={Search} className="mt-2">Explore programs</Button>
                  </Link>
                </div>
              )
          }
        </Row>
      </Container>

    </>
  );
};

export default ProgramListing;
