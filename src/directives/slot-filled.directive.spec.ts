import { defineCE, expect, fixture, html } from '@open-wc/testing';
import { LitElement } from 'lit';

import { slotFilled } from './slot-filled.directive.js';

describe('SlotFilledDirective', () => {
  it("doesn't set an attribute if no elements are present", async () => {
    // GIVEN a component with a slot-filled directive
    const tag = defineCE(
      class extends LitElement {
        override render() {
          return html`<div ${slotFilled('data-has-elements')}><slot></slot></div>`;
        }
      }
    );

    // WHEN no element is added to the slot
    const el = await fixture(`<${tag}></${tag}>`);

    // THEN the attribute is added to the host element
    const target = el.shadowRoot?.querySelector('div');
    expect(target).to.not.have.attribute('data-has-elements');
  });

  it('omits the attribute for text nodes or comments', async () => {
    // GIVEN a component with a slot-filled directive
    const tag = defineCE(
      class extends LitElement {
        override render() {
          return html`<div ${slotFilled('data-has-elements')}><slot></slot></div>`;
        }
      }
    );

    // WHEN not an element is added to the slot
    const el = await fixture(`<${tag}>Text node<!-- comment --></${tag}>`);

    // THEN the attribute is added to the host element
    const target = el.shadowRoot?.querySelector('div');
    expect(target).not.to.have.attribute('data-has-elements');
  });

  it('adds an attribute if elements are present', async () => {
    // GIVEN a component with a slot-filled directive
    const tag = defineCE(
      class extends LitElement {
        override render() {
          return html`<div ${slotFilled('data-has-elements')}><slot></slot></div>`;
        }
      }
    );

    // WHEN at least one element is added to the slot
    const el = await fixture(`<${tag}><span></span></${tag}>`);

    // THEN the attribute is added to the host element
    const target = el.shadowRoot?.querySelector('div');
    expect(target).to.have.attribute('data-has-elements');
  });

  it('considers all slots by default', async () => {
    // GIVEN a component with a slot-filled directive and multiple slots
    const tag = defineCE(
      class extends LitElement {
        override render() {
          return html`
            <div ${slotFilled('data-has-elements')}>
              <slot name="one"></slot>
              <slot name="two"></slot>
              <slot></slot>
            </div>
          `;
        }
      }
    );

    // WHEN elements are added to the named slots
    const el = await fixture(`<${tag}><span slot="one"></span><span slot="two"></span></${tag}>`);

    // THEN the attribute is added to the host element
    const target = el.shadowRoot?.querySelector('div');
    expect(target).to.have.attribute('data-has-elements');
  });

  it('only considers the specified named slot', async () => {
    // GIVEN a component with a slot-filled directive and multiple slots
    const tag = defineCE(
      class extends LitElement {
        override render() {
          return html`
            <div ${slotFilled('data-has-elements', 'two')}>
              <slot name="one"></slot>
              <slot name="two"></slot>
              <slot></slot>
            </div>
          `;
        }
      }
    );

    // WHEN elements are added to the other named slot
    const elOther = await fixture(`<${tag}><span slot="one"></span></${tag}>`);

    // THEN the attribute is not added to the host element
    const targetOther = elOther.shadowRoot?.querySelector('div');
    expect(targetOther).to.not.have.attribute('data-has-elements');

    // WHEN elements are added to the specified named slot
    const elCorrect = await fixture(`<${tag}><span slot="two"></span></${tag}>`);

    // THEN the attribute is added to the host element
    const targetCorrect = elCorrect.shadowRoot?.querySelector('div');
    expect(targetCorrect).to.have.attribute('data-has-elements');
  });

  it('only considers the default (unnamed) slot', async () => {
    // GIVEN a component with a slot-filled directive and multiple slots
    const tag = defineCE(
      class extends LitElement {
        override render() {
          return html`
            <div ${slotFilled('data-has-elements', '')}>
              <slot name="one"></slot>
              <slot name="two"></slot>
              <slot></slot>
            </div>
          `;
        }
      }
    );

    // WHEN elements are added to a named slot
    const elNamed = await fixture(`<${tag}><span slot="one"></span></${tag}>`);

    // THEN the attribute is not added to the host element
    const targetNamed = elNamed.shadowRoot?.querySelector('div');
    expect(targetNamed).to.not.have.attribute('data-has-elements');

    // WHEN elements are added to the default (unnamed) slot
    const elDefault = await fixture(`<${tag}><span></span></${tag}>`);

    // THEN the attribute is added to the host element
    const targetDefault = elDefault.shadowRoot?.querySelector('div');
    expect(targetDefault).to.have.attribute('data-has-elements');
  });
});
