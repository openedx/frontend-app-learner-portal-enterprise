import React from 'react';
import { render, act } from '@testing-library/react';
import ToastsProvider, { ToastsContext } from './ToastsProvider';

describe('ToastsProvider', () => {
  it('should add and remove toasts', () => {
    let toastsContext;
    render(
      <ToastsProvider>
        <ToastsContext.Consumer>
          {(context) => {
            toastsContext = context;
            return <div />;
          }}
        </ToastsContext.Consumer>
      </ToastsProvider>,
    );
    expect(toastsContext.toasts).toEqual([]);
    act(() => {
      toastsContext.addToast('Hello World');
    });
    expect(toastsContext.toasts.length).toBe(1);
    expect(toastsContext.toasts[0].message).toBe('Hello World');
    act(() => {
      toastsContext.removeToast(0);
    });
    expect(toastsContext.toasts.length).toBe(0);
  });
});
