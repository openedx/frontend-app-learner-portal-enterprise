import {
  Form,
  SearchField,
  Button,
  Col,
  SelectableBox,
  Chip,
} from "@edx/paragon";
import { useState } from "react";
import { goals, jobs, type, industryCards } from "./constants";

const SkillBuilderForm = () => {
  const [hide, setHide] = useState(false);
  const [goalSelected, setGoalSelected] = useState("");
  const [jobSelected, setJobSelected] = useState("");

  const [value, setValue] = useState("green");
  const handleChange = (e) => setValue(e.target.value);

  return (
    <Form className="form">
      <Form.Row>
        <Form.Group controlId="roles">
          <Col>
            <Form.Label>What roles are you interested in ?</Form.Label>
            <SearchField
              value="product management associate"
              onSubmit={(value) => console.log(`search submitted: ${value}`)}
            />
          </Col>
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Form.Group>
          <Col>
            <Button
              variant="link"
              size="inline"
              className="mb-2 mb-sm-0"
              onClick={() => setHide(!hide)}
            >
              {!hide ? "Hide advanced options" : "Show advanced options"}
            </Button>
          </Col>
        </Form.Group>
      </Form.Row>
      {!hide && (
        <>
          <Form.Row>
            <Form.Group controlId="roles">
              <Col>
                <Form.Label>
                  Tell us about what you want to achieve ?
                </Form.Label>
                <Form.Autosuggest
                  floatingLabel="Select a goal"
                  aria-label="AS-Goal"
                  errorMessageText="Error, no selected value"
                  value={goalSelected}
                  onSelected={(value) => setGoalSelected(value)}
                >
                  {goals.map((goal) => (
                    <Form.AutosuggestOption>{goal}</Form.AutosuggestOption>
                  ))}
                </Form.Autosuggest>
              </Col>
            </Form.Group>
          </Form.Row>
          <Form.Row>
            <Form.Group controlId="roles">
              <Col>
                <Form.Label>
                  Search and select your current job title
                </Form.Label>
                <Form.Autosuggest
                  floatingLabel="Search your current role"
                  aria-label="AS-Job"
                  errorMessageText="Error, no selected value"
                  value={jobSelected}
                  onSelected={(value) => setJobSelected(value)}
                >
                  {jobs.map((goal) => (
                    <Form.AutosuggestOption>{goal}</Form.AutosuggestOption>
                  ))}
                </Form.Autosuggest>
              </Col>
            </Form.Group>
          </Form.Row>
          <Form.Row>
            <Form.Group controlId="roles">
              <Col>
                <Form.Label>What industry are you interested in ?</Form.Label>
                <SearchField
                  placeholder={"Select one"}
                  onSubmit={(value) =>
                    console.log(`search submitted: ${value}`)
                  }
                />
              </Col>
            </Form.Group>
          </Form.Row>
          <Col>
            <SelectableBox.Set
              type={type}
              value={value}
              onChange={handleChange}
              name="colors"
              columns="3"
              className="selectable-box "
            >
              {industryCards.map((card) => (
                <SelectableBox
                  className="box"
                  value={card.name}
                  inputHidden={false}
                  type={type}
                  aria-label={card.name}
                >
                  <div>
                    <div className="lead">{card.name}</div>
                    <div className="x-small">Related skills</div>
                    {card.skills.map((skill) => (
                      <div>
                        <Chip>{skill}</Chip>
                      </div>
                    ))}
                  </div>
                </SelectableBox>
              ))}
            </SelectableBox.Set>
          </Col>
        </>
      )}
    </Form>
  );
};

export default SkillBuilderForm;
