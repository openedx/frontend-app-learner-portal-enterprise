import React, { useContext } from 'react';
import {
  Card, Hyperlink, Image,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';

const SearchAcademyCard = ({
  uuid, title, shortDescription, image, isLoading,
}) => {
  const { enterpriseConfig } = useContext(AppContext);

  return (
    <Card
      isClickable
      as={Hyperlink}
      isLoading={isLoading}
      destination={`/${enterpriseConfig.slug}/academy/${uuid}`}
    >
      <Card.Header title={title} />
      <Card.Section>
        {shortDescription}
      </Card.Section>
      <Card.Section className="clearfix">
        <Image className="float-right" src={image} />
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
