import React from 'react';
import edxLogo from '../skills-quiz/images/edx-logo.svg';

const SkillsQuizHeader = () => (
  <div style={{ display: 'flex' }} className="ml-2">
    <img src={edxLogo} alt="edx-logo" height="110px" />
    <div
      className="ml-5 vertical-line"
    />
    <div style={{ minWidth: 'max-content' }} className="ml-5 header-text">
      <h1 className="heading">Skills builder</h1>
      <h1 className="subheading-v2">
        Let edX be your guide
      </h1>
    </div>
  </div>
);

export default SkillsQuizHeader;
