import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Container, Stack } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform/config';
import { v4 as uuidv4 } from 'uuid';

import ContentHighlightSet from './ContentHighlightSet';
import { useEnterpriseCustomer } from '../../app/data';
import { useContentHighlightSets } from '../../hooks';

const ContentHighlights = ({ className }) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: contentHighlights } = useContentHighlightSets(enterpriseCustomer.uuid);

  const cards = useMemo(
    () => contentHighlights.map((highlight) => <ContentHighlightSet key={uuidv4()} {...highlight} />),
    [contentHighlights],
  );

  if (!getConfig().FEATURE_CONTENT_HIGHLIGHTS || contentHighlights.length === 0) {
    return null;
  }

  return (
    <Container size="lg" className={className}>
      <Stack gap={5}>
        {cards}
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
