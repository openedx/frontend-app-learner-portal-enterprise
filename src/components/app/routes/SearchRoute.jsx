import { generatePath, Link } from 'react-router-dom';
import { Container } from '@openedx/paragon';

import { useEnterpriseCustomerUserSubsidies, useEnterpriseLearner } from '../data';
import { SearchPage } from "../../search";
import { useSubscriptionLicense } from "../../enterprise-user-subsidy/data/hooks";
import useSubscriptionLicenses from "../../hooks/useSubscriptionLicenses";

const SearchRoute = () => {
  const { data: enterpriseCustomerUserSubsidies } = useEnterpriseCustomerUserSubsidies();
  const { data: { enterpriseCustomer } } = useEnterpriseLearner();
  const data = useSubscriptionLicenses()
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
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <SearchPage />
    </Container>
  );
};

export default SearchRoute;
