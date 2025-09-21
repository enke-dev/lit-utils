import type { ReactiveElement } from 'lit';

/**
 * Convenient interface to implement form-associated custom elements.
 * @see https://web.dev/articles/more-capable-form-controls
 * @example
 * ```ts
 * @customElement('text-input')
 * export class TextInputElement
 *   extends LitElement
 *   implements FormAssociated<string> {}
 *   ...
 * }
 * ```
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
    mode: 'autocomplete' | 'restore'
  ) => void;
}

/**
 * Naive application or creation of form data to a given object.
 * Updates (or creates) an object from the data of the given form.
 *
 * @param form form element to read data from
 * @param existing eventually existing data object to update
 * @param intercept function to intercept and modify the key-value pairs before applying them
 * @returns the updated / created data object
 *
 * @example
 * Read data from form as an object.
 *
 * ```html
 * <form>
 *   <input name="name" value="John">
 *   <input name="age" value="30">
 * </form>
 * ```
 * ```ts
 * const form = document.querySelector('form');
 * const data = applyFromFormData(form);
 * console.log(data);
 * ```
 * ```
 * { name: 'John', age: '30' }
 * ```
 *
 * @example
 * Update existing data object with form data.
 *
 * ```html
 * <form>
 *   <input name="name" value="John">
 *   <input name="age" value="30">
 * </form>
 * ```
 * ```ts
 * const existing = { gender: 'male', name: 'Peter' };
 * const updated = applyFromFormData(form, existing);
 * console.log(updated);
 * ```
 * ```
 * { gender: 'male', name: 'John', age: '30' }
 * ```
 *
 * @example
 * Manipulate form data before applying it.
 *
 * ```html
 * <form>
 *   <input name="name" value="John">
 *   <input name="age" value="30">
 * </form>
 * ```
 * ```ts
 * const existing = { name: 'Peter', age: 25 };
 * const updated = applyFromFormData(form, existing, (k, v) => k === 'age' ? parseInt(v as string, 10) : v);
 * console.log(updated);
 * ```
 * ```
 * { gender: 'male', name: 'John', age: 30 }
 * ```
 */
export function applyFromFormData<T extends object>(
  form: HTMLFormElement,
  existing = {} as T,
  intercept: (key: string, value: FormDataEntryValue) => unknown = (_, v) => v
): T | undefined {
  const data = new FormData(form);
  return Array.from(data.entries()).reduce(
    (all, [name, value]) => ({ ...all, [name]: intercept(name, value) }),
    existing
  );
}

/**
 * @private
 */
export type FormSubmitterType = 'button' | 'submit' | 'reset';

/**
 * @private
 */
export interface FormSubmitter extends ReactiveElement {
  readonly internals: ElementInternals;
  type: FormSubmitterType;
  name: string;
  value: string;
}

/**
 * @private
 */
export type FormSubmitterConstructor =
  | (new () => FormSubmitter)
  | (abstract new () => FormSubmitter);

/**
 * Sets up a form submitter to handle form submission events.
 *
 * This function adds an event listener to the submitter that handles click events,
 * processes the form submission, and sets the submitter value in the form internals.
 *
 * Borrowed from {@link https://github.com/material-components/material-web/blob/main/internal/controller/form-submitter.ts#L82 | Material Web }.
 *
 * @param ctor The constructor of the form submitter element.
 *
 * @example
 * {@link FormAssociated | Form aware} custom button element.
 *
 * ```ts
 * @customElement('form-button')
 * export class Button extends LitElement {
 *   // make the element form aware
 *   static readonly formAssociated = true;
 *
 *   // a static initialization block that executes when the class is
 *   // first loaded, rather than when instances are created (an ES2022
 *   // feature, but the Typescript compiler will handle that)
 *   static {
 *     setupFormSubmitter(Button);
 *   }
 *
 *   // the element internals, which is required for form association
 *   readonly internals = this.attachInternals() as unknown as ElementInternals;
 *
 *   // ...
 * }
 * ```
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
        { capture: true, once: true }
      );

      elementInternals.setFormValue(submitter.value);
      form.requestSubmit();
    });
  });
}
