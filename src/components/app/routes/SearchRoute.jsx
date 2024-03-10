import { generatePath, Link } from 'react-router-dom';
import {
  Button, Container, useToggle,
} from '@openedx/paragon';

import { useEnterpriseCustomerUserSubsidies, useEnterpriseCustomer } from '../data';
import { SearchPage } from '../../search';

const SearchRoute = () => {
  const { data: enterpriseCustomerUserSubsidies } = useEnterpriseCustomerUserSubsidies();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const [isOpen, open, close] = useToggle();

  return (
    <Container size="lg" className="py-4">
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
      <Button onClick={() => (isOpen ? close() : open())}>{!isOpen ? 'Show JSON' : 'Hide JSON'}</Button>
      <br />
      <br />
      <pre hidden={!isOpen}>{JSON.stringify(enterpriseCustomerUserSubsidies, null, 2)}</pre>
      <SearchPage />
    </Container>
  );
};

export default SearchRoute;
