import React from 'react';
import { Card, CardGrid } from '@edx/paragon';
import { LOADING_NO_OF_CARDS } from './constants';

const CardLoadingSkeleton = () => (
  <CardGrid>
    {Array.from({ length: LOADING_NO_OF_CARDS }, () => (
      <Card isLoading>
        <Card.ImageCap />
        <Card.Header />
        <Card.Section />
      </Card>
    ))}
  </CardGrid>
);

export default CardLoadingSkeleton;
