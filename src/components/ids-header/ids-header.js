import {
  IdsElement,
  customElement,
  scss,
  mix,
  attributes
} from '../../core/ids-element';

import {
  IdsEventsMixin,
  IdsKeyboardMixin,
  IdsThemeMixin
} from '../../mixins';

import { IdsXssUtils } from '../../utils/ids-xss-utils/ids-xss-utils';

import IdsInput from '../ids-input';

import styles from './ids-header.scss';

/**
 * IDS Header Component
 * @type {IdsHeader}
 * @inherits IdsElement
 * @mixes IdsEventsMixin
 * @mixes IdsKeyboardMixin
 * @mixes IdsThemeMixin
 */
@customElement('ids-header')
@scss(styles)

class IdsHeader extends mix(IdsElement).with(
    IdsEventsMixin,
    IdsKeyboardMixin,
    IdsThemeMixin
  ) {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback?.();
    this.#refreshVariants();
  }

  static get attributes() {
    return [
      ...super.attributes,
      attributes.COLOR,
      attributes.MODE,
      attributes.VERSION
    ];
  }

  /**
   * Create the template for the header contents
   * @returns {string} The template
   */
  template() {
    return `
    <div class="ids-header">
      <slot></slot>
    </div>`;
  }

  #refreshVariants() {
    const elementNames = ['ids-button', 'ids-search-field', 'ids-text', 'ids-theme-switcher'];

    for (const element of elementNames) {
      const idsElements = [...this.querySelectorAll(element)];
      idsElements.forEach((elem) => {
        elem.colorVariant = 'alternate';
      });
    }
  }

  /**
   * Sets the color attribute
   * @param {string} c string value for color
   */
  set color(c) {
    if (typeof c !== 'string' || !c.length) {
      return;
    }
    const sanitzedVal = IdsXssUtils.stripHTML(c);
    this.container.style.backgroundColor = sanitzedVal;
    this.setAttribute('color', sanitzedVal);
  }

  get color() {
    return this.getAttribute('color') || '#0072ed';
  }
}

export default IdsHeader;
