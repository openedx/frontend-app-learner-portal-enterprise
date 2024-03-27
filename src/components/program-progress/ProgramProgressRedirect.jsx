import { Navigate, useParams } from 'react-router-dom';

import { useEnterpriseCustomer } from '../app/data';

const ProgramProgressRedirect = () => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { programUUID } = useParams();

  return <Navigate to={`/${enterpriseCustomer.slug}/program/${programUUID}/progress`} replace />;
};

export default ProgramProgressRedirect;
