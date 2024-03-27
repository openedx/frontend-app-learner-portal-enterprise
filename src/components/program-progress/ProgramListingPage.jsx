import { CardGrid } from '@openedx/paragon';

import ProgramListingCard from './ProgramListingCard';
import { useEnterpriseProgramsList } from '../app/data';

const ProgramListingPage = () => {
  const { data: enterprisePrograms } = useEnterpriseProgramsList();
  return (
    <div className="py-5" data-testid="program-listing-page">
      <CardGrid columnSizes={{ xs: 12, lg: 6 }}>
        {enterprisePrograms.map((program) => <ProgramListingCard program={program} key={program.title} />)}
      </CardGrid>
    </div>
  );
};

export default ProgramListingPage;
