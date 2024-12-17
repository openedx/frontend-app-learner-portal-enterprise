import { Icon, OverlayTrigger, Tooltip } from '@openedx/paragon';
import { StarFilled, StarOutline } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { useVideoCourseReviews } from '../app/data';
import { fixDecimalNumber } from '../course/data';

const VideoCourseReview = ({ courseKey }) => {
  const { data: courseReviews } = useVideoCourseReviews(courseKey);
  const intl = useIntl();
  if (!courseReviews) {
    return null;
  }
  const rating = Math.round(fixDecimalNumber(courseReviews?.avgCourseRating ?? 0)); // Round to the nearest whole number
  const totalStars = 5; // Total number of stars

  return (
    <div className="d-flex flex-row justify-content-center align-items-center mt-2 x-small">
      {courseReviews?.avgCourseRating
      && (
        <span>{fixDecimalNumber(courseReviews.avgCourseRating ?? 0)}
        </span>
      )}
      {courseReviews?.reviewsCount > 0
      && (
        <OverlayTrigger
          placement="top"
          overlay={(
            <Tooltip variant="light" id="video-course-rating">
              {intl.formatMessage({
                id: 'enterprise.videoDetailPage.courseReviews.averageRating',
                defaultMessage: '{reviewsCount} learners have rated this course in a post completion survey.',
                description: 'The average rating of the course on a 5-star scale',
              }, {
                reviewsCount: courseReviews.reviewsCount,
              })}
            </Tooltip>
          )}
        >
          <span className="d-flex flex-row mx-1 p-0">
            {Array.from({ length: totalStars }, (_, index) => (
              <Icon
                key={index}
                className="star-color"
                size="xs"
                src={index < rating ? StarFilled : StarOutline}
              />
            ))}
          </span>
        </OverlayTrigger>
      )}
      {courseReviews?.reviewsCount > 0 && <span>({courseReviews.reviewsCount})</span>}
      <span className="mx-2">|</span>
      {courseReviews?.totalEnrollments > 0 && (
        <span>
          <FormattedMessage
            id="enterprise.courseAbout.learnersReviews.demand.and.growth.in.last.year"
            defaultMessage="{totalEnrollments} recently enrolled!"
            description="The number of learners who took the course in the last 12 months"
            values={{
              totalEnrollments: courseReviews.totalEnrollments,
            }}
          />
        </span>
      )}
    </div>
  );
};

VideoCourseReview.propTypes = {
  courseKey: PropTypes.string.isRequired,
};

export default VideoCourseReview;
