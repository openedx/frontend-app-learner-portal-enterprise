import { Card } from '@openedx/paragon';
import React, { memo, useState } from 'react';
import cardFallbackImg from '@edx/brand/paragon/images/card-imagecap-fallback.png';

const SearchCourseCardImageCap = ({ course, primaryPartnerLogo }) => {
  const [onLoadStart, setOnLoadStart] = useState(null);
  return (
    <Card.ImageCap
      src={course.cardImageUrl || course.originalImageUrl || cardFallbackImg}
      fallbackSrc={cardFallbackImg}
      srcAlt=""
      logoSrc={primaryPartnerLogo?.src}
      logoAlt={primaryPartnerLogo?.alt}
      imageLoadingType={['lazy']}
    />
  );
};

export const MemoizedImageCap = memo(SearchCourseCardImageCap);
