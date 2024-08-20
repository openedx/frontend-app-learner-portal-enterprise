import React from 'react';

// mock the loadable function to load the module eagarly and expose a preload() function
function loadable(load) {
  let Component;
  // Capture the component from the module load function
  // eslint-disable-next-line no-return-assign
  const loadPromise = load().then((val) => (Component = val.default));
  // Create a react component which renders the loaded component
  const payload = {
    on: jest.fn().mockImplementation((event, callback) => { callback(); }),
  };
  const Loadable = (props) => {
    if (!Component) {
      throw new Error(
        `Bundle split module not loaded yet, import statement: ${load.toString()}`,
      );
    }
    // eslint-disable-next-line react/prop-types
    if (props.onReady) {
      // eslint-disable-next-line no-return-assign, react/prop-types
      return <Component {...props} onLoad={props.onReady(payload)} />;
    }
    return <Component {...props} />;
  };
  Loadable.preload = () => loadPromise;
  return Loadable;
}

export default loadable;
