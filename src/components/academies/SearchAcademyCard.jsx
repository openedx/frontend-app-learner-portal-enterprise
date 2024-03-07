import React from 'react';
import {
  Card, Hyperlink, Image,
} from '@openedx/paragon';
import PropTypes from 'prop-types';

import './styles/Academy.scss';
import { useEnterpriseCustomer } from '../hooks';

const SearchAcademyCard = ({
  uuid, title, shortDescription, image, isLoading,
}) => {
  const enterpriseCustomer = useEnterpriseCustomer();

  return (
    <Card
      isClickable
      as={Hyperlink}
      isLoading={isLoading}
      destination={`/${enterpriseCustomer.slug}/academies/${uuid}/`}
      className="academy-card"
    >
      <Card.Header title={title} />
      <Card.Section>
        {shortDescription}
      </Card.Section>
      <br />
      <br />
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
