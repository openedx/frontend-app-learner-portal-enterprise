import { Link } from 'react-router-dom';
import { Card, Image } from '@openedx/paragon';
import PropTypes from 'prop-types';

import { useEnterpriseCustomer } from '../app/data';

import './styles/Academy.scss';

const SearchAcademyCard = ({
  uuid, title, shortDescription, image, isLoading,
}) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return (
    <Card
      isClickable
      as={Link}
      isLoading={isLoading}
      to={`/${enterpriseCustomer.slug}/academies/${uuid}/`}
      className="academy-card d-inline-flex"
    >
      <Card.Header title={title} />
      <Card.Section>{shortDescription}</Card.Section>
      <Card.Section />
      <Card.Section className="clearfix">
        <Image className="float-right academy-card-image" src={image} />
      </Card.Section>
    </Card>
  );
};

const SkeletonAcademyCard = (props) => (
  <SearchAcademyCard {...props} isLoading />
);

SearchAcademyCard.propTypes = {
  uuid: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  shortDescription: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
};

SearchAcademyCard.defaultProps = {
  isLoading: false,
};

SearchAcademyCard.Skeleton = SkeletonAcademyCard;
export default SearchAcademyCard;
