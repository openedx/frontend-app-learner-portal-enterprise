/* eslint-disable react/no-unstable-nested-components */
import {
  Col, Container, Icon, Row,
} from '@openedx/paragon';
import { useMemo, useState } from 'react';
import { StarFilled } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { fixDecimalNumber } from './data/utils';
import { REVIEW_SECTION_CONTENT } from './data/constants';
import { useCourseReviews } from '../app/data';

function useCourseReviewInfoContent() {
  const [showInfoContent, setShowInfoContent] = useState(undefined);
  const intl = useIntl();
  const { data: courseReviews } = useCourseReviews();

  const infoContent = useMemo(() => {
    if (!courseReviews) {
      return null;
    }

    if (showInfoContent === REVIEW_SECTION_CONTENT.AVERAGE_RATING) {
      return (
        intl.formatMessage({
          id: 'course.about.reviews.averageRating',
          defaultMessage: '<b>{reviewsCount}</b> learners have rated this course in a post completion survey.',
          description: 'The average rating of the course based on the reviews from learners',
        }, {
          reviewsCount: courseReviews.reviewsCount || 0,
          b: (chunks) => <b>{chunks}</b>,
        })
      );
    }
    if (showInfoContent === REVIEW_SECTION_CONTENT.CONFIDENT_LEARNERS) {
      return (
        intl.formatMessage({
          id: 'enterprise.course.about.course.reviews.confident.learners.percentage',
          defaultMessage: 'We asked learners who participated in this course how confident they felt that the course will help them reach their goal. <b>{confidentLearnersPercentage}%</b> of learners said they were <b>“extremely confident”</b> or <b>“very confident”</b> that the learning they did in the course will help them reach their goals.',
          description: 'The percentage of confident learners',
        }, {
          confidentLearnersPercentage: Math.round(courseReviews.confidentLearnersPercentage, 0),
          b: (chunks) => <b>{chunks}</b>,
        })
      );
    }
    if (showInfoContent === REVIEW_SECTION_CONTENT.MOST_COMMON_GOAL_LEARNERS) {
      return (
        intl.formatMessage({
          id: 'enterprise.course.about.course.reviews.most.common.goal.learners.percentage',
          defaultMessage: 'We asked learners who enrolled in this course to choose the reason for taking it. Options were: “learn valuable skills”, “job advancement”, “learn for fun”, and “change careers”. <b>{mostCommonGoalLearnersPercentage}%</b> of learners who enrolled in this course took it to <b>learn valuable skills</b>.',
          description: 'The percentage of learners who took the course to learn new skills',
        }, {
          mostCommonGoalLearnersPercentage: Math.round(courseReviews.mostCommonGoalLearnersPercentage, 0),
          b: (chunks) => <b>{chunks}</b>,
        })
      );
    }
    if (showInfoContent === REVIEW_SECTION_CONTENT.DEMAND_AND_GROWTH) {
      return (
        intl.formatMessage({
          id: 'enterprise.course.about.course.reviews.learners.demand.and.growth',
          defaultMessage: '<b>{totalCourseEnrollments}</b> learners took this course in the past year.',
          description: 'The number of learners who took the course in the last 12 months',
        }, {
          totalCourseEnrollments: courseReviews.totalEnrollments || 0,
          b: (chunks) => <b>{chunks}</b>,
        })
      );
    }
    return null;
  }, [intl, courseReviews, showInfoContent]);

  return {
    infoContent,
    showInfoContent,
    setShowInfoContent,
  };
}

const CourseReview = () => {
  const { data: courseReviews } = useCourseReviews();
  const {
    infoContent,
    showInfoContent,
    setShowInfoContent,
  } = useCourseReviewInfoContent();

  if (!courseReviews) {
    return null;
  }

  return (
    <Container className="ml-0 pl-0">
      <Row className="mt-3.5 mb-1.5">
        <Col>
          <h3>
            <FormattedMessage
              id="enterprise.course.about.reviews.impact"
              defaultMessage="The Impact:"
              description="Label for the section that lists the impact of the course on learners."
            />
          </h3>
        </Col>
      </Row>
      <Row>
        <Col id="review-1">
          <h1
            role="presentation"
            data-testid="demand-and-growth"
            onClick={() => { setShowInfoContent(REVIEW_SECTION_CONTENT.DEMAND_AND_GROWTH); }}
            className={`number-color mb-0 ${ showInfoContent === REVIEW_SECTION_CONTENT.DEMAND_AND_GROWTH && 'text-underline'}`}
          >
            {courseReviews?.totalEnrollments.toLocaleString('en-US')}
          </h1>
          <div>
            <FormattedMessage
              id="enterprise.course.about.course.learners.reviews.demand.and.growth.in.last.year"
              defaultMessage="learners took this course in the last 12 months"
              description="The number of learners who took the course in the last 12 months"
            />
          </div>
        </Col>
        <Col id="review-2">
          <div className="d-flex align-items-center">
            <h1
              role="presentation"
              data-testid="average-rating"
              onClick={() => { setShowInfoContent(REVIEW_SECTION_CONTENT.AVERAGE_RATING); }}
              className={`number-color mb-0 ${ showInfoContent === REVIEW_SECTION_CONTENT.AVERAGE_RATING && 'text-underline'}`}
            >
              {fixDecimalNumber(courseReviews.avgCourseRating)}
            </h1>
            <Icon className="star-color" src={StarFilled} />
          </div>
          <div>
            <FormattedMessage
              id="enterprise.course.about.course.reviews.average.rating"
              defaultMessage="<b>average rating</b> for this course on a 5-star scale"
              description="The average rating of the course on a 5-star scale"
              values={{
                b: (chunks) => <b>{chunks}</b>,
              }}
            />
          </div>
        </Col>
        <Col id="review-3">
          <h1
            role="presentation"
            data-testid="confident-learners"
            onClick={() => { setShowInfoContent(REVIEW_SECTION_CONTENT.CONFIDENT_LEARNERS); }}
            className={`number-color mb-0 ${ showInfoContent === REVIEW_SECTION_CONTENT.CONFIDENT_LEARNERS && 'text-underline'}`}
          >
            {Math.round(courseReviews.confidentLearnersPercentage, 0)}%
          </h1>
          <div>
            <FormattedMessage
              id="enterprise.course.about.course.confident.learners.reviews.percentage."
              defaultMessage="are confident this course will help them <b>reach their goals</b>"
              description="The percentage of learners who are confident this course will help them reach their goals"
              values={{
                b: (chunks) => <b>{chunks}</b>,
              }}
            />
          </div>
        </Col>
        <Col id="review-4">
          <h1
            role="presentation"
            data-testid="most-common-goal-learners"
            onClick={() => { setShowInfoContent(REVIEW_SECTION_CONTENT.MOST_COMMON_GOAL_LEARNERS); }}
            className={`number-color mb-0 ${ showInfoContent === REVIEW_SECTION_CONTENT.MOST_COMMON_GOAL_LEARNERS && 'text-underline'}`}
          >
            {Math.round(courseReviews.mostCommonGoalLearnersPercentage, 0)}%
          </h1>
          <div>
            <FormattedMessage
              id="enterprise.course.about.course.most.common.goal.learners.reviews.percentage"
              defaultMessage="of the learners took this course to <b>learn new skills</b>"
              description="The percentage of learners who took this course to learn new skills"
              values={{
                b: (chunks) => <b>{chunks}</b>,
              }}
            />
          </div>
        </Col>
      </Row>
      <Row className="mt-3.5 mb-4.5">
        <Col>
          <span className="small">{infoContent}</span>
        </Col>
      </Row>
    </Container>
  );
};
export default CourseReview;
