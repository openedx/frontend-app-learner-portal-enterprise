import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import edxLogo from '../skills-quiz/images/edx-logo.svg';

const SkillsQuizHeader = () => (
  <div style={{ display: 'flex' }} className="ml-2">
    <img src={edxLogo} alt="edx-logo" height="110px" />
    <div className="ml-5 vertical-line" />
    <div style={{ minWidth: 'max-content' }} className="ml-5 header-text">
      <h1 className="heading">
        <FormattedMessage
          id="enterprise.skills.quiz.v2.skills.builder.heading"
          defaultMessage="Skills Builder"
          description="Skills builder heading on skills quiz v2 page"
        />
      </h1>
      <h1 className="subheading-v2 text-light-500">
        <FormattedMessage
          id="enterprise.skills.quiz.v2.skills.builder.subheading"
          defaultMessage="Let edX be your guide"
          description="Skills builder subheading on skills quiz v2 page"
        />
      </h1>
    </div>
  </div>
);

export default SkillsQuizHeader;
