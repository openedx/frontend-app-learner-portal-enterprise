import { useMemo } from 'react';
import { CardGrid } from '@openedx/paragon';

import PathwayProgressCard from './PathwayProgressCard';
import { useEnterprisePathwaysList } from '../app/data';

// [tech debt] This should be moved to an import within the `src/index.scss` file.
import './styles/index.scss';

const PathwayProgressListingPage = () => {
  const { data: enterprisePathways } = useEnterprisePathwaysList();
  const pathwayProgressCards = useMemo(() => enterprisePathways.map((pathway) => (
    <PathwayProgressCard
      pathway={pathway}
      key={pathway.learnerPathwayProgress.uuid}
    />
  )), [enterprisePathways]);
  return (
    <div className="py-5" data-testid="pathway-listing-page">
      <CardGrid columnSizes={{ xs: 12, lg: 6 }}>
        {pathwayProgressCards}
      </CardGrid>
    </div>
  );
};

export default PathwayProgressListingPage;
