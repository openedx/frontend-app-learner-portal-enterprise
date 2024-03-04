import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Container, Stack,
} from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform/config';
import { AppContext } from '@edx/frontend-platform/react';
import { v4 as uuidv4 } from 'uuid';

import { useContentHighlights } from './data';
import ContentHighlightSet from './ContentHighlightSet';

const ContentHighlights = ({ className }) => {
  const { enterpriseConfig: { uuid: enterpriseUUID } } = useContext(AppContext);
  const {
    isLoading,
    contentHighlights,
  } = useContentHighlights(enterpriseUUID);

  if (!getConfig().FEATURE_CONTENT_HIGHLIGHTS) {
    return null;
  }

  if (isLoading) {
    return (
      <Container size="lg" className={className}>
        <ContentHighlightSet.Skeleton />
      </Container>
    );
  }

  if (contentHighlights.length === 0) {
    return null;
  }

  return (
    <Container size="lg" className={className}>
      <Stack gap={5}>
        {contentHighlights.map((highlightSet) => <ContentHighlightSet key={uuidv4()} highlightSet={highlightSet} />)}
      </Stack>
    </Container>
  );
};

ContentHighlights.propTypes = {
  className: PropTypes.string,
};

ContentHighlights.defaultProps = {
  className: undefined,
};

export default ContentHighlights;
