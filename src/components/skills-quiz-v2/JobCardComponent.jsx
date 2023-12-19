import { SelectableBox, Chip, Spinner } from "@edx/paragon";
import { useState } from "react";
import PropTypes from "prop-types";

const JobCardComponent = ({ jobs, isLoading }) => {
  const [value, setValue] = useState("");
  const handleChange = (e) => setValue(e.target.value);
  return (
    // <>abc</>
    <>
      {!isLoading ? (
        <SelectableBox.Set
          type={"radio"}
          value={value}
          onChange={handleChange}
          name="industry"
          columns="3"
          className="selectable-box mt-4"
        >
          {jobs.map((job) => (
            <SelectableBox
              className="box"
              value={job.name}
              inputHidden={false}
              type={"radio"}
              aria-label={job.name}
              isLoading={isLoading}
            >
              <div>
                <div className="lead">{job.name}</div>
                <div className="x-small mt-3">Related skills</div>
                {job.skills.slice(0, 5).map((skill) => (
                  <div>
                    <Chip>{skill.name}</Chip>
                  </div>
                ))}
              </div>
            </SelectableBox>
          ))}
        </SelectableBox.Set>
      ) : (
        <Spinner
          animation="border"
          className="mie-3 d-block mt-4"
          screenReaderText="loading"
        />
      )}
    </>
  );
};

JobCardComponent.defaultProps = {
  jobs: undefined,
  isLoading: false,
};

JobCardComponent.propTypes = {
  isLoading: PropTypes.bool,
  jobs: PropTypes.arrayOf(PropTypes.shape()),
};

export default JobCardComponent;
