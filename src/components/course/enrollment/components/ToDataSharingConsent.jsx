import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Hyperlink } from '@edx/paragon';

import { CourseContext } from '../../CourseContextProvider';
import { useTrackSearchConversionClickHandler } from '../../data/hooks';
import { enrollLinkClass } from '../constants';
import { EnrollButtonCta } from '../common';

// Data sharing consent
const ToDataSharingConsentPage = ({ enrollLabel, enrollmentUrl }) => {
  const {
    state: {
      activeCourseRun: { key: courseKey },
      algoliaSearchParams,
    },
  } = useContext(CourseContext);
  const handleClick = useTrackSearchConversionClickHandler({
    href: enrollmentUrl,
    objectId: algoliaSearchParams.objectId,
    queryId: algoliaSearchParams.queryId,
    courseKey,
    eventName: 'edx.ui.enterprise.learner_portal.course.enroll_button.to_dsc.clicked',
  });

  return (
    <EnrollButtonCta
      enrollLabel={enrollLabel}
      as={Hyperlink}
      className={classNames('btn btn-primary btn-brand-primary', enrollLinkClass)}
      href={enrollmentUrl}
      onClick={handleClick}
    />
  );
};

ToDataSharingConsentPage.propTypes = {
  enrollLabel: PropTypes.node.isRequired,
  enrollmentUrl: PropTypes.string.isRequired,
};

export default ToDataSharingConsentPage;
