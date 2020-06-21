import React, { useContext, useState, useRef } from 'react';
import moment from 'moment';
import { Input } from '@edx/paragon';

import { CourseContext } from './CourseContextProvider';
import { SET_COURSE_RUN } from './data/constants';

export default function CourseRunSelector() {
  const { dispatch, state } = useContext(CourseContext);
  const {
    activeCourseRun,
    course: {
      courseRuns,
    },
  } = state;
  const [editing, setEditing] = useState(false);
  const selectRef = useRef(activeCourseRun.uuid);
  const multipleRunsAvailable = courseRuns && courseRuns.length > 1;

  const handleClick = () => {
    const selectedCourseRun = courseRuns.find((courseRun) => courseRun.uuid === selectRef.current.value);
    dispatch({ type: SET_COURSE_RUN, payload: selectedCourseRun });
    setEditing(false);
  };

  if (multipleRunsAvailable) {
    if (!editing) {
      return (
        <button type="button" onClick={() => setEditing(true)} className="btn btn-link mb-1 p-0">
          more dates
        </button>
      );
    }
    return (
      <div className="d-inline-flex mb-2">
        <Input
          name="courseRun"
          className="mr-2"
          type="select"
          label="Start Date:"
          defaultValue={activeCourseRun.uuid}
          options={
            courseRuns.map(({ start, uuid }) => (
              {
                label: moment(start).format('MMM D, YYYY'),
                value: uuid,
              }
            ))
          }
          ref={selectRef}
        />
        <button type="button" className="btn btn-primary" onClick={() => handleClick()}>
          go
        </button>
      </div>
    );
  }
  return null;
}
