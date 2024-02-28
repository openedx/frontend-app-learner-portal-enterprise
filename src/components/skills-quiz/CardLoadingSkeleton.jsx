import React from 'react';
import { Card, CardGrid } from '@openedx/paragon';
import { v4 as uuidv4 } from 'uuid';

import { LOADING_NO_OF_CARDS } from './constants';

const CardLoadingSkeleton = () => (
  <CardGrid>
    {Array.from({ length: LOADING_NO_OF_CARDS }, () => (
      <Card key={uuidv4()} isLoading>
        <Card.ImageCap />
        <Card.Header />
        <Card.Section />
      </Card>
    ))}
  </CardGrid>
);

export default CardLoadingSkeleton;
