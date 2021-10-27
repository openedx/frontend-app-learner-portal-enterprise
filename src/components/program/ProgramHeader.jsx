import React, { useContext } from 'react';

import { Container } from '@edx/paragon';
import { ProgramContext } from './ProgramContextProvider';

const ProgramHeader = () => {
  const { program: { title } } = useContext(ProgramContext);

  return (
    <div className="program-header pt-5">
      <Container size="lg">
        <h1>{title}</h1>
      </Container>
    </div>
  );
};

export default ProgramHeader;
