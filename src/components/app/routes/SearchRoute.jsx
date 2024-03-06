import { generatePath, Link } from 'react-router-dom';
import { Container } from '@openedx/paragon';

import { useEnterpriseCustomerUserSubsidies, useEnterpriseLearner } from '../data';
import { SearchPage } from "../../search";

const SearchRoute = () => {
  const { data: enterpriseCustomerUserSubsidies } = useEnterpriseCustomerUserSubsidies();
  const { data: { enterpriseCustomer } } = useEnterpriseLearner();
  return (
    <Container size="lg" className="py-4">
      <h2>Search</h2>
      <Link
        to={generatePath('/:enterpriseSlug/course/:courseKey', {
          enterpriseSlug: enterpriseCustomer.slug,
          courseKey: 'edX+DemoX',
        })}
      >
        Course
      </Link>
      <br />
      <br />
      {/*<pre>{JSON.stringify(enterpriseCustomerUserSubsidies, null, 2)}</pre>*/}
      <SearchPage />
    </Container>
  );
};

export default SearchRoute;
