import { render, screen, act } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import userEvent from '@testing-library/user-event';
import ToastsProvider, { ToastsContext } from './ToastsProvider';
import Toasts from './Toasts';

describe('ToastsProvider', () => {
  it('should add and remove toasts', () => {
    let toastsContext;
    render(
      <IntlProvider locale="en">
        <ToastsProvider>
          <ToastsContext.Consumer>
            {(context) => {
              toastsContext = context;
              return <Toasts />;
            }}
          </ToastsContext.Consumer>
        </ToastsProvider>,
      </IntlProvider>,
    );
    expect(toastsContext.toasts).toEqual([]);
    act(() => {
      toastsContext.addToast('Hello World');
    });
    expect(toastsContext.toasts.length).toBe(1);
    expect(toastsContext.toasts[0].message).toBe('Hello World');
    expect(screen.getByText('Hello World')).toBeTruthy();
    act(() => {
      toastsContext.removeToast(0);
    });
    expect(toastsContext.toasts.length).toBe(0);
    expect(screen.queryByText('Hello World')).toBeFalsy();
  });
  it('should remove toasts when the user clicks', () => {
    let toastsContext;
    render(
      <IntlProvider locale="en">
        <ToastsProvider>
          <ToastsContext.Consumer>
            {(context) => {
              toastsContext = context;
              return <Toasts />;
            }}
          </ToastsContext.Consumer>
        </ToastsProvider>,
      </IntlProvider>,
    );
    act(() => {
      toastsContext.addToast('Hello World');
    });
    expect(toastsContext.toasts.length).toBe(1);
    expect(toastsContext.toasts[0].message).toBe('Hello World');
    expect(screen.getByText('Hello World')).toBeTruthy();
    const closeButton = screen.getByLabelText('Close');
    const toastContainerClassesBefore = screen.getAllByRole('alert')[1].className;

    expect(toastContainerClassesBefore.match(/show/)).toBeTruthy();

    userEvent.click(closeButton);
    const toastContainerClassesAfter = screen.getAllByRole('alert')[0].className;

    expect(toastContainerClassesAfter.match(/show/)).toBeFalsy();
  });
});
