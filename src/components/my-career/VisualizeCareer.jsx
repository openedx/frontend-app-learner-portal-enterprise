import React, { useContext } from 'react';

import PropTypes from 'prop-types';
import {
  ActionRow, Button, Hyperlink, Icon, Row, useToggle,
} from '@edx/paragon';
import { AppContext, ErrorPage } from '@edx/frontend-platform/react';
import { useLearnerSkillLevels } from './data/hooks';
import { LoadingSpinner } from '../loading-spinner';
import SpiderChart from './SpiderChart';
import CategoryCard from './CategoryCard';

const VisualizeCareer = ({ jobId }) => {
  const {
    enterpriseConfig: {
      slug,
    },
  } = useContext(AppContext);

  const [showInstructions, , , toggleShowInstructions] = useToggle(false);

  const [learnerSkillLevels, learnerSkillLevelsFetchError] = useLearnerSkillLevels(jobId);

  if (learnerSkillLevelsFetchError) {
    return <ErrorPage status={learnerSkillLevelsFetchError.status} />;
  }

  if (!learnerSkillLevels) {
    return (
      <div className="py-5">
        <LoadingSpinner data-testid="loading-spinner" screenReaderText="Visualize Career Tab" />
      </div>
    );
  }

  const { skillCategories } = learnerSkillLevels;

  return (
    <div className="py-5 row">
      <div className="my-career-column col-xs-10 col-lg-6">
        <div className="align-items-center">
          <Row>
            <ActionRow>
              <p>Current Role</p>
              <ActionRow.Spacer />
              <Hyperlink destination={`/${slug}/skills-quiz`} class="edit-job-role-link">
                <Icon className="fa fa-pencil edit-job-role-icon" screenReaderText="Edit Role" />
                <span className="edit-job-role-text">Edit</span>
              </Hyperlink>
            </ActionRow>
          </Row>
          <Row>
            <ActionRow>
              <b>{learnerSkillLevels.name}</b>
              <ActionRow.Spacer />
            </ActionRow>
          </Row>
          {skillCategories && (
            <>
              <Row className="action-row">
                <ActionRow>
                  <p>My Career Chart</p>
                  <ActionRow.Spacer />
                </ActionRow>
              </Row>
              <SpiderChart className="plotly-graph" categories={learnerSkillLevels} />
            </>
          )}
          {skillCategories && (
            <Row>
              <ActionRow>
                <Button
                  variant="link"
                  size="inline"
                  data-testid="reading-instructions-button"
                  onClick={() => toggleShowInstructions()}
                >
                  How do I read this?
                </Button>
                <ActionRow.Spacer />
              </ActionRow>
              {showInstructions && (
                <div className="text-muted skills-chart-reading-instructions">
                  <p>
                    Using the Lightcast taxonomy, we trace your currently selected job title to the
                    competencies and skills needed to succeed. As you pass courses on the edX platform
                    teaching skills relevant to your current job, the graph above shows how you are
                    growing in the competenices related to your role.
                  </p>
                </div>
              )}
            </Row>
          )}
          {skillCategories && (
            <Row className="skills-category-card-section">
              {skillCategories.map((category) => (
                <CategoryCard key={category.id} topCategory={category} />
              ))}
            </Row>
          )}
        </div>
      </div>
    </div>
  );
};

VisualizeCareer.propTypes = {
  jobId: PropTypes.number.isRequired,
};

export default VisualizeCareer;
