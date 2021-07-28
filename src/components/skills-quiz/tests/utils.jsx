import React from 'react';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';

import { SearchData } from '@edx/frontend-enterprise-catalog-search';

// eslint-disable-next-line import/prefer-default-export
export const renderWithSearchContext = (children) => renderWithRouter(
  <SearchData>
    {children}
  </SearchData>,
);
