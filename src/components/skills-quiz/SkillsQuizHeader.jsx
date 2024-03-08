import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import edxLogo from './images/edx-logo.svg';

const SkillsQuizHeader = () => (
  <div style={{ display: 'flex' }} className="ml-2">
    <img src={edxLogo} alt="edx-logo" height="110px" />
    <div
      className="ml-5 vertical-line"
    />
    <div style={{ minWidth: 'max-content' }} className="ml-5 header-text">
      <h1 className="heading">
        <FormattedMessage
          id="enterprise.skills.quiz.v1.skills.builder.heading"
          defaultMessage="Skills Builder"
          description="Skills builder heading on skills quiz v1 page"
        />
      </h1>
      <h2 className="subheading">
        <FormattedMessage
          id="enterprise.skills.quiz.v1.skills.builder.subheading"
          defaultMessage="Start your learning journey with edX"
          description="Skills builder subheading to start learning journey with edx, on skills quiz v1 page"
        />
      </h2>
    </div>
  </div>
);

export default SkillsQuizHeader;
