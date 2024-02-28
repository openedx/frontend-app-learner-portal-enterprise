import {
  Col, Container, Icon, Row,
} from '@openedx/paragon';
import React, { useContext, useState } from 'react';
import { StarFilled } from '@openedx/paragon/icons';
import { fixDecimalNumber } from './data/utils';
import { CourseContext } from './CourseContextProvider';
import { REVIEW_SECTION_CONTENT } from './data/constants';

const CourseReview = () => {
  const { state } = useContext(CourseContext);
  const { courseReviews } = state;
  const [showInfoContent, setShowInfoContent] = useState('');
  if (!courseReviews) {
    return '';
  }

  let infoContent;
  if (showInfoContent === REVIEW_SECTION_CONTENT.AVERAGE_RATING) {
    infoContent = `<b>${courseReviews.reviewsCount}</b> learners have rated this course in a post completion survey.`;
  } else if (showInfoContent === REVIEW_SECTION_CONTENT.CONFIDENT_LEARNERS) {
    infoContent = `We asked learners who participated in this course how confident they felt that the course will help
       them reach their goal. <b>${parseInt(courseReviews.confidentLearnersPercentage, 10)}%</b> of learners said they were
        <b>“extremely confident”</b> or <b>“very confident”</b> that the learning they did in the course will help them reach
         their goals.`;
  } else if (showInfoContent === REVIEW_SECTION_CONTENT.MOST_COMMON_GOAL_LEARNERS) {
    infoContent = `We asked learners who enrolled in this course to choose the reason for taking it. Options were:
        “learn valuable skills”, “job advancement”, “learn for fun”, and “change careers”. 
           <b>${parseInt(courseReviews.mostCommonGoalLearnersPercentage, 10)}%</b> of learners who
           enrolled in this course took it to <b>learn valuable skills</b>.`;
  } else if (showInfoContent === REVIEW_SECTION_CONTENT.DEMAND_AND_GROWTH) {
    infoContent = `<b>${courseReviews.totalEnrollments}</b> learners took this course in the past year.`;
  }

  return (
    <Container className="ml-0 pl-0">
      <Row className="mt-3.5 mb-1.5">
        <Col sm={12}><h3>The Impact:</h3></Col>
      </Row>
      <Row>
        <Col sm className="mr-4" id="review-1">
          <h1
            role="presentation"
            data-testid="demand-and-growth"
            onClick={() => { setShowInfoContent(REVIEW_SECTION_CONTENT.DEMAND_AND_GROWTH); }}
            className={`number-color mb-0 ${ showInfoContent === REVIEW_SECTION_CONTENT.DEMAND_AND_GROWTH && 'text-underline'}`}
          >
            {courseReviews.totalEnrollments}
          </h1>
          <div>learners took this course in the last 12 months</div>
        </Col>
        <Col sm className="mr-4" id="review-2">
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
          <div><b>average rating</b> for this course on a 5-star scale</div>
        </Col>
        <Col sm className="mr-4" id="review-3">
          <h1
            role="presentation"
            data-testid="confident-learners"
            onClick={() => { setShowInfoContent(REVIEW_SECTION_CONTENT.CONFIDENT_LEARNERS); }}
            className={`number-color mb-0 ${ showInfoContent === REVIEW_SECTION_CONTENT.CONFIDENT_LEARNERS && 'text-underline'}`}
          >
            {parseInt(courseReviews.confidentLearnersPercentage, 10)}%
          </h1>
          <div>are confident this course will help them <b>reach their goals</b></div>
        </Col>
        <Col sm className="mr-4" id="review-4">
          <h1
            role="presentation"
            data-testid="most-common-goal-learners"
            onClick={() => { setShowInfoContent(REVIEW_SECTION_CONTENT.MOST_COMMON_GOAL_LEARNERS); }}
            className={`number-color mb-0 ${ showInfoContent === REVIEW_SECTION_CONTENT.MOST_COMMON_GOAL_LEARNERS && 'text-underline'}`}
          >
            {parseInt(courseReviews.mostCommonGoalLearnersPercentage, 10)}%
          </h1>
          <div>of the learners took this course to <b>learn new skills</b></div>
        </Col>
      </Row>
      <Row className="mt-3.5 mb-4.5">
        {/* eslint-disable-next-line react/no-danger */}
        <Col sm={12}><span dangerouslySetInnerHTML={{ __html: infoContent }} /> </Col>
      </Row>
    </Container>
  );
};
export default CourseReview;
