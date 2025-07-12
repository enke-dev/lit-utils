import type { ReactiveElement } from 'lit';

/**
 * Convenient interface to implement form-associated custom elements.
 */
export interface FormAssociated<T> {
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;

  label?: string;
  name?: string;
  value?: T;

  // https://web.dev/more-capable-form-controls/#lifecycle-callbacks
  formAssociatedCallback?: (form: HTMLFormElement) => void;
  formDisabledCallback?: (disabled: boolean) => void;
  formResetCallback?: () => void;
  formStateRestoreCallback?: (
    state: string | File | FormData | null,
    mode: 'autocomplete' | 'restore',
  ) => void;
}

/**
 * Naive application or creation of form data to a given object.
 *
 * Updates (or creates) a user object from the data of the given form.
 * @param form form element to read data from
 * @param existing eventually existing user object to update
 * @returns the updated / created user object
 */
export function applyFromFormData<T extends object>(
  form: HTMLFormElement,
  existing = {} as T,
): T | undefined {
  const data = new FormData(form);
  return Array.from(data.entries()).reduce(
    (all, [name, value]) => ({ ...all, [name]: value }),
    existing,
  );
}

/**
 * Borrowed from `@material/web/internal/controller/form-submitter.js`.
 * @see https://github.com/material-components/material-web/blob/main/internal/controller/form-submitter.ts
 */
export type FormSubmitterType = 'button' | 'submit' | 'reset';
export interface FormSubmitter extends ReactiveElement {
  readonly internals: ElementInternals;
  type: FormSubmitterType;
  name: string;
  value: string;
}

type FormSubmitterConstructor = (new () => FormSubmitter) | (abstract new () => FormSubmitter);

/**
 * Sets up a form submitter to handle form submission events.
 *
 * This function adds an event listener to the submitter that handles click events,
 * processes the form submission, and sets the submitter value in the form internals.
 *
 * @param ctor The constructor of the form submitter element.
 */
export function setupFormSubmitter(ctor: FormSubmitterConstructor) {
  (ctor as unknown as typeof ReactiveElement).addInitializer(instance => {
    const submitter = instance as FormSubmitter;
    submitter.addEventListener('click', async event => {
      const { type, internals: elementInternals } = submitter;
      const { form } = elementInternals;
      if (!form || type === 'button') {
        return;
      }

      // Wait a full task for event bubbling to complete.
      await new Promise<void>(resolve => {
        setTimeout(resolve);
      });

      if (event.defaultPrevented) {
        return;
      }

      if (type === 'reset') {
        form.reset();
        return;
      }

      form.addEventListener(
        'submit',
        submitEvent => {
          Object.defineProperty(submitEvent, 'submitter', {
            configurable: true,
            enumerable: true,
            get: () => submitter,
          });
        },
        { capture: true, once: true },
      );

      elementInternals.setFormValue(submitter.value);
      form.requestSubmit();
    });
  });
}
