import React, {
  useContext, useEffect, useMemo, useState,
} from 'react';

import PropTypes from 'prop-types';
import { Button, Card, useToggle } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform/config';
import algoliasearch from 'algoliasearch/lite';
import { AppContext } from '@edx/frontend-platform/react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import LevelBars from './LevelBars';
import SkillsRecommendationCourses from './SkillsRecommendationCourses';
import { UserSubsidyContext } from '../enterprise-user-subsidy';
import { features } from '../../config';
import { determineLearnerHasContentAssignmentsOnly } from '../enterprise-user-subsidy/data/utils';
import { SubsidyRequestsContext } from '../enterprise-subsidy-requests';
import { SUBSIDY_TYPE } from '../../constants';

const CategoryCard = ({ topCategory }) => {
  const { skillsSubcategories } = topCategory;
  const [subcategory, setSubcategory] = useState(null);
  const [subcategorySkills, setSubcategorySkills] = useState(null);
  const [subCategoryName, setSubCategoryName] = useState(null);
  const [subCategorySkillsLength, setSubCategorySkillsLength] = useState(null);
  const [showSkills, setShowSkillsOn, , toggleShowSkills] = useToggle(false);
  const [showAll, setShowAllOn, setShowAllOff, toggleShowAll] = useToggle(false);
  const [showLess, , setShowLessOff, toggleShowLess] = useToggle(false);
  const {
    redeemableLearnerCreditPolicies,
    hasCurrentEnterpriseOffers,
    subscriptionPlan,
    subscriptionLicense,
    couponCodes: { couponCodesCount },
  } = useContext(UserSubsidyContext);
  const { requestsBySubsidyType } = useContext(SubsidyRequestsContext);
  const licenseRequests = requestsBySubsidyType[SUBSIDY_TYPE.LICENSE];
  const couponCodeRequests = requestsBySubsidyType[SUBSIDY_TYPE.COUPON];
  const isCourseSearchDisabled = determineLearnerHasContentAssignmentsOnly({
    redeemableLearnerCreditPolicies,
    subscriptionPlan,
    subscriptionLicense,
    licenseRequests,
    couponCodesCount,
    couponCodeRequests,
    hasCurrentEnterpriseOffers,
  });

  const featuredIsCourseSearchDisabled = features.FEATURE_ENABLE_TOP_DOWN_ASSIGNMENT && isCourseSearchDisabled;

  const config = getConfig();
  const { enterpriseConfig } = useContext(AppContext);
  const courseIndex = useMemo(
    () => {
      const client = algoliasearch(
        config.ALGOLIA_APP_ID,
        config.ALGOLIA_SEARCH_API_KEY,
      );
      return client.initIndex(config.ALGOLIA_INDEX_NAME);
    },
    [config.ALGOLIA_APP_ID, config.ALGOLIA_INDEX_NAME, config.ALGOLIA_SEARCH_API_KEY],
  );

  const filterRenderableSkills = (skills) => {
    const renderableSkills = [];
    for (let i = 0; i < skills.length; i += 1) {
      renderableSkills.push(skills[i]);
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

  const openFirstSubcategoryPill = () => skillsSubcategories?.[0] && handleSubcategoryClick(skillsSubcategories[0]);

  useEffect(() => {
    openFirstSubcategoryPill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
              <LevelBars skillLevel={skill.score ? skill.score : 0} />
              {skill.name}
            </div>
          ))}
        </div>,
      );
    }
    return skills;
  };

  return (
    <Card className="mb-4.5">
      <Card.Header className="mt-n3" title={topCategory.name} />
      <Card.Section>
        {skillsSubcategories.map((skillsSubcategory) => (
          <Button
            variant="light"
            size="sm"
            className="mr-1 mb-1"
            data-testid="skill-category-chip"
            onClick={() => handleSubcategoryClick(skillsSubcategory)}
          >
            {skillsSubcategory.name}
          </Button>
        ))}
      </Card.Section>
      {subcategorySkills && showSkills && (
        <Card.Section className="mt-n3">
          <div>
            <h5>{subCategoryName} Skills</h5>
          </div>
          <div>
            {renderSkillsWithLevelsChunk(subcategorySkills)}
          </div>
        </Card.Section>
      )}
      {subcategorySkills && subCategorySkillsLength > 3 && (
        <Button
          variant="link"
          className="mb-1 mt-n4 justify-content-end"
          onClick={() => {
            handleShowAllClick();
          }}
          testid="show-all-less-button"
        >
          {showAll && !showLess && (
            <span>
              <FormattedMessage
                id="enterprise.dashboard.my.career.tab.visualize.career.data.show.all.skills"
                defaultMessage="Show ({totalSkillsCount}) {rightArrowIcon}"
                description="Label for button to show all skills in a category"
                values={{
                  totalSkillsCount: subCategorySkillsLength,
                  rightArrowIcon: '>',
                }}
              />
            </span>
          )}
          {!showAll && showLess && (
            <span>
              <FormattedMessage
                id="enterprise.dashboard.my.career.tab.visualize.career.data.show.less.skills"
                defaultMessage="Show Less"
                description="Label for button to show less skills in a category"
              />
            </span>
          )}
          {
            !showAll && !showLess && (
              null)
          }
        </Button>
      )}
      {(!enterpriseConfig.disableSearch && !featuredIsCourseSearchDisabled) && (
        <Card.Section>
          {showSkills && subcategorySkills && (
            <div className="skill-details-recommended-courses">
              <SkillsRecommendationCourses
                index={courseIndex}
                subCategoryName={subCategoryName}
                subCategorySkills={subcategorySkills.map((skill) => skill.name)}
              />
            </div>
          )}
        </Card.Section>
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
