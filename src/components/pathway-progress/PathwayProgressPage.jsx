import { Helmet } from 'react-helmet';

import {
  Container,
} from '@openedx/paragon';

import PathwayProgressHeader from './PathwayProgressHeader';
import PathwayRequirements from './PathwayRequirements';
import './styles/index.scss';
import { useLearnerPathwayProgressData } from '../app/data';
import NotFoundPage from '../NotFoundPage';

const PathwayProgressPage = () => {
  const { data: pathwayProgressDetails } = useLearnerPathwayProgressData();

  if (!pathwayProgressDetails) {
    return <NotFoundPage />;
  }

  const PATHWAY_TITLE = `${pathwayProgressDetails.learnerPathwayProgress.title}`;

  return (
    <>
      <Helmet title={PATHWAY_TITLE} />
      <Container fluid={false}>
        <PathwayProgressHeader />
        <PathwayRequirements />
      </Container>
    </>
  );
};

export default PathwayProgressPage;
