import {
  Form,
} from '@edx/paragon';
import React, { useState } from 'react';

const AutoSuggestDropDown = () => {
  const [selected, setSelected] = useState('');

  return (
    <Form.Autosuggest
      aria-label="form autosuggest"
      value={selected}
      onSelected={(value) => setSelected(value)}
    >
      <Form.AutosuggestOption>JavaScript</Form.AutosuggestOption>
      <Form.AutosuggestOption>Python</Form.AutosuggestOption>
      <Form.AutosuggestOption>Excel</Form.AutosuggestOption>
      <Form.AutosuggestOption>React</Form.AutosuggestOption>
      <Form.AutosuggestOption>Rube</Form.AutosuggestOption>
    </Form.Autosuggest>
  );
};

export default AutoSuggestDropDown;
