import React, { useState } from 'react';

import PropTypes from 'prop-types';
import {
  Card,
  Button,
  Chip,
  useToggle,
} from '@edx/paragon';
import LevelBars from './LevelBars';

const CategoryCard = ({ topCategory }) => {
  const { skillsSubcategories } = topCategory;
  const [subcategory, setSubcategory] = useState(null);
  const [subcategorySkills, setSubcategorySkills] = useState(null);
  const [subCategoryName, setSubCategoryName] = useState(null);
  const [subCategorySkillsLength, setSubCategorySkillsLength] = useState(null);
  const [showSkills, setShowSkillsOn, , toggleShowSkills] = useToggle(false);
  const [showAll, setShowAllOn, setShowAllOff, toggleShowAll] = useToggle(false);
  const [showLess, , setShowLessOff, toggleShowLess] = useToggle(false);

  const filterRenderableSkills = (skills) => {
    const renderableSkills = [];
    for (let i = 0; i < skills.length; i += 1) {
      if (skills[i].score) {
        renderableSkills.push(skills[i]);
      }
    }
    return renderableSkills;
  };

  const handleSubcategoryClick = (skillsSubcategory) => {
    if (subCategoryName === skillsSubcategory.name) {
      // Hide the subcategory skills list
      toggleShowSkills();
    } else {
      // Show the subcategory skills for another subcategory
      setShowSkillsOn();
    }
    if (showSkills) {
      setShowAllOff();
      setShowLessOff();
    } else {
      setShowAllOn();
    }
    setSubCategoryName(skillsSubcategory.name);
    setSubcategory(skillsSubcategory);
    setSubCategorySkillsLength(skillsSubcategory.skills.length);
    setSubcategorySkills(skillsSubcategory.skills.slice(0, 3));

    setSubCategoryName(skillsSubcategory.name);
    setSubcategory(skillsSubcategory);
    const renderableSkills = filterRenderableSkills(skillsSubcategory.skills);
    setSubCategorySkillsLength(renderableSkills.length);
    setSubcategorySkills(renderableSkills.slice(0, 3));
  };

  const handleShowAllClick = () => {
    toggleShowAll();
    toggleShowLess();
    const renderableSkills = filterRenderableSkills(subcategory.skills);
    if (showAll === true) {
      setSubcategorySkills(renderableSkills);
    } else {
      setSubcategorySkills(renderableSkills.slice(0, 3));
    }
  };

  const renderSkillsWithLevelsChunk = (renderableSkills) => {
    const skills = [];
    for (let i = 0; i < renderableSkills.length; i += 3) {
      skills.push(
        <div className="skill-level-details-row">
          {renderableSkills.slice(i, i + 3).map((skill) => (
            <div className="skill-detail" data-testid="skill-name">
              <LevelBars skillLevel={skill.level} />
              {skill.name}
            </div>
          ))}
        </div>,
      );
    }
    return skills;
  };

  return (
    <Card className="skills-category-card">
      <Card.Header className="category-name-section" title={topCategory.name} />
      <Card.Section className="category-skill-chips-section">
        {skillsSubcategories.map((skillsSubcategory) => (
          <Chip data-testid="skill-category-chip" onClick={() => handleSubcategoryClick(skillsSubcategory)}>
            {skillsSubcategory.name}
          </Chip>
        ))}
      </Card.Section>
      {subcategorySkills && showSkills && (
        <Card.Section className="skill-details-section">
          <>
            <div>
              <h5>{subCategoryName} Skills</h5>
            </div>
            <div>
              {renderSkillsWithLevelsChunk(subcategorySkills)}
            </div>
          </>
        </Card.Section>
      )}
      {subcategorySkills && subCategorySkillsLength > 3 && (
        <Card.Footer>
          <Button
            variant="link"
            className="mb-1 mb-sm-0 skill-details-section-button"
            onClick={() => {
              handleShowAllClick();
            }}
            testid="show-all-less-button"
          >
            {showAll && !showLess && (
              <span>Show ({subCategorySkillsLength}) &gt;</span>
            )}
            {!showAll && showLess && (
              <span>Show Less</span>
            )}
            {
              !showAll && !showLess && (
                null)
            }
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
};

CategoryCard.propTypes = {
  topCategory: PropTypes.shape({
    name: PropTypes.string.isRequired,
    skillsSubcategories: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        skills: PropTypes.arrayOf(
          PropTypes.shape({
            name: PropTypes.string.isRequired,
          }),
        ).isRequired,
      }),
    ).isRequired,
  }).isRequired,
};

export default CategoryCard;
