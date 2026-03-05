import { expect } from '@open-wc/testing';
import { defineCE, fixture, html } from '@open-wc/testing-helpers';
import { LitElement } from 'lit';

import { ROUTER_NAVIGATE_COMMAND } from '../utils/router.utils.js';
import { link } from './link.directive.js';

describe('LinkDirective', () => {
  it('sets href on anchor elements', async () => {
    // GIVEN a component with a link directive
    const tag = defineCE(
      class extends LitElement {
        override render() {
          return html`<a ${link('https://example.com')}>Link</a>`;
        }
      }
    );

    // WHEN the component is rendered
    const el = await fixture(`<${tag}></${tag}>`);

    // THEN the href attribute is set on the anchor element
    const anchor = el.shadowRoot?.querySelector('a');
    expect(anchor).to.have.attribute('href', 'https://example.com');
  });

  it('sets data-href and role on button elements', async () => {
    // GIVEN a component with a link directive on a button
    const tag = defineCE(
      class extends LitElement {
        override render() {
          return html`<button ${link('/home')}>Clickable button</button>`;
        }
      }
    );

    // WHEN the component is rendered
    const el = await fixture(`<${tag}></${tag}>`);

    // THEN the data-href and role attributes are set on the div element
    const div = el.shadowRoot?.querySelector('button');
    expect(div).to.have.attribute('data-href', '/home');
    expect(div).to.have.attribute('role', 'link');
  });

  it('sets data-href and role on non-anchor elements', async () => {
    // GIVEN a component with a link directive on a div
    const tag = defineCE(
      class extends LitElement {
        override render() {
          return html`<div ${link('/home', { role: 'button' })}>Clickable Div</div>`;
        }
      }
    );

    // WHEN the component is rendered
    const el = await fixture(`<${tag}></${tag}>`);

    // THEN the data-href and role attributes are set on the div element
    const div = el.shadowRoot?.querySelector('div');
    expect(div).to.have.attribute('data-href', '/home');
    expect(div).to.have.attribute('role', 'button');
  });

  it('emits a navigation command to the link on click', async () => {
    // GIVEN a component with a link directive
    const tag = defineCE(
      class extends LitElement {
        override render() {
          return html`<a ${link('/dashboard')}>Dashboard</a>`;
        }
      }
    );

    // WHEN the link is clicked
    const el = await fixture(`<${tag}></${tag}>`);
    const anchor = el.shadowRoot?.querySelector('a') as HTMLAnchorElement;

    let navigatedTo: string | null = null;
    window.addEventListener(ROUTER_NAVIGATE_COMMAND, (event: Event) => {
      const customEvent = event as CustomEvent;
      navigatedTo = customEvent.detail.path;
    });

    anchor.click();

    // THEN a navigation command is emitted with the correct path
    expect(navigatedTo).to.equal('/dashboard');
  });

  it('preserves native behavior when native option is set', async () => {
    // GIVEN a component with a link directive with native option
    const tag = defineCE(
      class extends LitElement {
        override render() {
          return html`<a ${link('https://example.com', { native: true })}>Native Link</a>`;
        }
      }
    );

    // WHEN the link is clicked
    const el = await fixture(`<${tag}></${tag}>`);
    const anchor = el.shadowRoot?.querySelector('a') as HTMLAnchorElement;

    let navigatedTo: string | null = null;
    window.addEventListener(ROUTER_NAVIGATE_COMMAND, (event: Event) => {
      const customEvent = event as CustomEvent;
      navigatedTo = customEvent.detail.path;
    });

    anchor.click();

    // THEN no navigation command is emitted and native behavior is preserved
    expect(navigatedTo).to.be.null;
  });

  it('does not add a backlink when the link points to the current page', async () => {
    // GIVEN the component is rendered while already on the link's target page
    history.pushState({}, '', '/login');
    const tag = defineCE(
      class extends LitElement {
        override render() {
          return html`<a ${link('/login', { addBacklink: 'back' })}>Login</a>`;
        }
      }
    );

    // WHEN the component is rendered
    const el = await fixture(`<${tag}></${tag}>`);

    // THEN the href does not include a self-referential backlink
    const anchor = el.shadowRoot?.querySelector('a');
    expect(anchor).to.have.attribute('href', '/login');
  });

  it('adds the current path as a backlink query parameter to the href on anchor elements', async () => {
    // GIVEN a component with a link directive with addBacklink option
    history.pushState({}, '', '/current-page');
    const tag = defineCE(
      class extends LitElement {
        override render() {
          return html`<a ${link('/login', { addBacklink: 'back' })}>Login</a>`;
        }
      }
    );

    // WHEN the component is rendered
    const el = await fixture(`<${tag}></${tag}>`);

    // THEN the href includes the current path as a backlink query parameter
    const anchor = el.shadowRoot?.querySelector('a');
    expect(anchor).to.have.attribute('href', '/login?back=%2Fcurrent-page');
  });

  it('adds the current path as a backlink query parameter to data-href on non-anchor elements', async () => {
    // GIVEN a component with a link directive with addBacklink option on a button
    history.pushState({}, '', '/current-page');
    const tag = defineCE(
      class extends LitElement {
        override render() {
          return html`<button ${link('/login', { addBacklink: 'back' })}>Login</button>`;
        }
      }
    );

    // WHEN the component is rendered
    const el = await fixture(`<${tag}></${tag}>`);

    // THEN the data-href includes the current path as a backlink query parameter
    const button = el.shadowRoot?.querySelector('button');
    expect(button).to.have.attribute('data-href', '/login?back=%2Fcurrent-page');
  });

  it('emits a navigation command with the backlink when addBacklink is set', async () => {
    // GIVEN a component with a link directive with addBacklink option
    history.pushState({}, '', '/current-page');
    const tag = defineCE(
      class extends LitElement {
        override render() {
          return html`<a ${link('/profile', { addBacklink: 'returnTo' })}>Profile</a>`;
        }
      }
    );

    // WHEN the link is clicked
    const el = await fixture(`<${tag}></${tag}>`);
    const anchor = el.shadowRoot?.querySelector('a') as HTMLAnchorElement;

    let navigatedTo: string | null = null;
    window.addEventListener(ROUTER_NAVIGATE_COMMAND, (event: Event) => {
      const customEvent = event as CustomEvent;
      navigatedTo = customEvent.detail.path;
    });

    anchor.click();

    // THEN a navigation command is emitted with the correct path including the backlink
    expect(navigatedTo).to.equal('/profile?returnTo=%2Fcurrent-page');
  });
});
