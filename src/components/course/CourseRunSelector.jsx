import React, { useContext, useState, useRef } from 'react';
import moment from 'moment';
import { Button, Input } from '@edx/paragon';

import { CourseContext } from './CourseContextProvider';
import { SET_COURSE_RUN } from './data/constants';

export default function CourseRunSelector() {
  const { dispatch, state } = useContext(CourseContext);
  const {
    activeCourseRun,
    availableCourseRuns,
  } = state;
  const [editing, setEditing] = useState(false);
  const selectRef = useRef(activeCourseRun.uuid);
  const multipleRunsAvailable = availableCourseRuns?.length > 1;

  const handleClick = () => {
    const selectedCourseRun = availableCourseRuns.find((courseRun) => courseRun.uuid === selectRef.current.value);
    dispatch({ type: SET_COURSE_RUN, payload: selectedCourseRun });
    setEditing(false);
  };

  if (multipleRunsAvailable) {
    if (!editing) {
      return (
        <button type="button" onClick={() => setEditing(true)} className="btn btn-link mb-1 p-0 btn-brand-primary">
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
            availableCourseRuns.map(({ start, uuid }) => (
              {
                label: moment(start).format('MMM D, YYYY'),
                value: uuid,
              }
            ))
          }
          ref={selectRef}
        />
        <Button
          buttonType="primary"
          className="btn-brand-primary ml-2"
          onClick={() => handleClick()}
        >
          go
        </Button>
      </div>
    );
  }
  return null;
}
