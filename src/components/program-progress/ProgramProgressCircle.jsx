import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import {
  X_AXIS, Y_AXIS, CIRCLE_RADIUS, CIRCLE_DEGREES, STROKE_WIDTH, CIRCLE_LABEL,
} from './data/constants';
import { useLearnerProgramProgressData } from '../app/data';

const CircleSegment = ({
  total, index, classList,
}) => {
  const segmentDash = 2 * Math.PI * CIRCLE_RADIUS;
  const degreeInc = 360 / total;
  // Remove strokeWidth to show a gap between the segments
  let dashArray = segmentDash - STROKE_WIDTH;
  const segmentDegrees = CIRCLE_DEGREES + (index * degreeInc);
  const offset = 100 - ((1 / total) * 100);
  // Want the incomplete segments to have no gaps
  if (classList === 'incomplete' && (index + 1) < total) {
    dashArray = segmentDash;
  }

  return (
    <circle
      data-testid="circle-segment"
      className={classList}
      r={CIRCLE_RADIUS}
      cx={X_AXIS}
      cy={Y_AXIS}
      transform={`rotate(${segmentDegrees} ${X_AXIS} ${Y_AXIS})`}
      strokeWidth={STROKE_WIDTH}
      fill="none"
      strokeDasharray={dashArray}
      strokeDashoffset={offset}
    />
  );
};

const ProgramProgressCircle = () => {
  const { data: { programData, courseData } } = useLearnerProgramProgressData();
  const { inProgress, completed, notStarted } = courseData;
  const totalCourses = inProgress.length + completed.length + notStarted.length;
  const title = `${programData.type} Progress`;
  return (
    <>
      <h2 className="progress-heading-circle">{title}</h2>
      <div className="progress-circle-wrapper">
        <svg data-testid="svg-circle" className="progress-circle" viewBox="0 0 44 44" aria-hidden="true">
          <circle className="bg" r={CIRCLE_RADIUS} cx={X_AXIS} cy={Y_AXIS} strokeWidth={STROKE_WIDTH} fill="none" />
          {Array(totalCourses).fill().map((_, index) => (
            <CircleSegment
              key={uuidv4()}
              total={totalCourses}
              index={index}
              classList={index >= completed.length ? 'incomplete' : 'complete'}
            />
          ))}
        </svg>
        <div className="progress-label">
          <div className="numbers">
            <span className="complete">{completed.length}</span>/<span className="total">{totalCourses}</span>
          </div>
          <div className="label">{ CIRCLE_LABEL }</div>
        </div>
      </div>
    </>
  );
};

export default ProgramProgressCircle;

CircleSegment.propTypes = {
  total: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
  classList: PropTypes.string.isRequired,
};
