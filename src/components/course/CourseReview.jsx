import {
  Col, Container, Icon, Row,
} from '@edx/paragon';
import React from 'react';
import { StarFilled } from '@edx/paragon/icons';

const CourseReview = () => (
  <Container className="ml-0 pl-0">
    <Row className="mt-3.5 mb-1.5">
      <Col sm={12}><h3>The Impact:</h3></Col>
    </Row>
    <Row>
      <Col sm className="mr-4">
        <h1 className="number-color mb-0">300</h1>
        <div>learners took this course in the last 12 months</div>
      </Col>
      <Col sm className="mr-4">
        <div className="d-flex align-items-center"><h1 className="number-color mb-0">4.5</h1><Icon className="star-color" src={StarFilled} />
        </div>
        <div><b>average rating</b> for this course on a 5-star scale</div>
      </Col>
      <Col sm className="mr-4">
        <h1 className="number-color mb-0">85%</h1>
        <div>are confident this course will help them <b>reach their goals</b></div>
      </Col>
      <Col sm className="mr-4">
        <h1 className="number-color mb-0">40%</h1>
        <div>of the learners took this course to <b>learn new skills</b></div>
      </Col>
    </Row>
    <Row className="mt-3.5 mb-4.5">
      <Col sm={12}><span>450 learner took this course in 2022 in comparison to 300 learners in 2021</span></Col>
    </Row>
  </Container>
);
export default CourseReview;
