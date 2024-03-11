import { generatePath, Link } from 'react-router-dom';
import { SearchPage } from '../../search';
import { useEnterpriseCustomer } from '../data';

const SearchRoute = () => {
  const { data: { slug } } = useEnterpriseCustomer();
  return (
    <>
      <Link
        to={generatePath('/:enterpriseSlug/course/:courseKey', {
          enterpriseSlug: slug,
          courseKey: 'edX+DemoX',
        })}
      >
        Course
      </Link>
      <SearchPage />
    </>
  );
};

export default SearchRoute;
