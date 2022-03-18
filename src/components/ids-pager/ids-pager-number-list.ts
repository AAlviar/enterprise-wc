import { customElement, scss } from '../../core/ids-decorators';
import { attributes } from '../../core/ids-attributes';
import { stringToBool } from '../../utils/ids-string-utils/ids-string-utils';

import Base from './ids-pager-number-list-base';
import '../ids-text/ids-text';
import '../ids-button/ids-button';

import styles from './ids-pager-number-list.scss';

/**
 * IDS PagerNumberList Component
 *
 * @type {IdsPagerNumberList}
 * @inherits IdsElement
 * @part number selectable number among the list
 */
@customElement('ids-pager-number-list')
@scss(styles)
export default class IdsPagerNumberList extends Base {
  constructor() {
    super();
  }

  template() {
    return (
      `<div class="ids-pager-number-list">
      </div>`
    );
  }

  static get attributes() {
    return [
      attributes.DISABLED,
      attributes.PAGE_NUMBER,
      attributes.PARENT_DISABLED,
      attributes.TOTAL,
      attributes.PAGE_SIZE,
      attributes.VALUE
    ];
  }

  connectedCallback() {
    // give parent a chance to reflect attributes

    window.requestAnimationFrame(() => {
      this.#populatePageNumberButtons();
    });

    super.connectedCallback?.();
  }

  /**
   * @param {number} value The number of items shown per page
   */
  set pageSize(value: number) {
    let nextValue;

    if (Number.isNaN(value)) {
      nextValue = 1;
    } else {
      nextValue = value;
    }

    if (parseInt(this.getAttribute(attributes.PAGE_SIZE)) !== nextValue) {
      this.setAttribute(attributes.PAGE_SIZE, nextValue);
    }

    this.#populatePageNumberButtons();
  }

  /** @returns {number} The number of items shown per page */
  get pageSize(): number {
    return parseInt(this.getAttribute(attributes.PAGE_SIZE));
  }

  /** @param {number} value A value 1-based page number shown */
  set pageNumber(value: number) {
    let nextValue = value;

    if (Number.isNaN(nextValue)) {
      nextValue = 1;
    } else if (nextValue <= 1) {
      nextValue = 1;
    } else {
      const pageCount = Math.ceil(this.total / this.pageSize);
      nextValue = Math.min(nextValue, pageCount);
    }

    if (!Number.isNaN(nextValue)
    && Number.parseInt(this.getAttribute(attributes.PAGE_NUMBER)) !== nextValue
    ) {
      this.setAttribute(attributes.PAGE_NUMBER, nextValue);
    }

    this.#populatePageNumberButtons();
  }

  /** @returns {number} A value 1-based page number displayed */
  get pageNumber(): number {
    return parseInt(this.getAttribute(attributes.PAGE_NUMBER));
  }

  /** @param {number} value The number of items to track */
  set total(value: number) {
    let nextValue;
    if (Number.isNaN(value)) {
      nextValue = 1;
    } else if (value <= 0) {
      nextValue = 1;
    } else {
      nextValue = value;
    }

    if (Number.parseInt(this.getAttribute(attributes.TOTAL)) !== nextValue) {
      this.setAttribute(attributes.TOTAL, nextValue);
    }
  }

  /** @returns {string|number} The number of items for pager is tracking */
  get total() {
    return parseInt(this.getAttribute(attributes.TOTAL));
  }

  /** @returns {number|null} The calculated pageCount using total and pageSize */
  get pageCount() {
    return this.hasAttribute(attributes.TOTAL)
      ? Math.ceil(this.total / this.pageSize)
      : null;
  }

  /** @param {boolean|string} value Whether to disable input at app-specified-level */
  set disabled(value) {
    if (stringToBool(value)) {
      this.setAttribute(attributes.DISABLED, '');
    } else {
      this.removeAttribute(attributes.DISABLED);
    }

    this.#updateDisabledState();
  }

  /** @returns {string|boolean} A flag indicating whether button is disabled for nav reasons */
  get disabled() {
    return this.hasAttribute(attributes.DISABLED);
  }

  /**
   * @param {string|boolean} value A flag indicating if button is disabled through parent pager's
   * disabled attribute
   */
  set parentDisabled(value) {
    if (stringToBool(value)) {
      this.setAttribute(attributes.PARENT_DISABLED, '');
    } else {
      this.removeAttribute(attributes.PARENT_DISABLED);
    }

    this.#updateDisabledState();
  }

  /**
   * @returns {string|boolean} A flag indicating whether button is
   * disabled via parent pager's disabled attribute
   */
  get parentDisabled() {
    return this.hasAttribute(attributes.PARENT_DISABLED);
  }

  /**
   * @returns {string|boolean} Whether the functionality overall is disabled based on
   * a combination of other available disabled fields
   */
  get disabledOverall() {
    return (this.hasAttribute(attributes.DISABLED)
      || this.hasAttribute(attributes.PARENT_DISABLED)
    );
  }

  /**
   * update visible button disabled state
   * based on parentDisabled and disabled attribs
   */
  #updateDisabledState() {
    for (const el of this.container.children) {
      if (this.disabledOverall) {
        el.setAttribute(attributes.DISABLED, '');
      } else {
        el.removeAttribute(attributes.DISABLED);
      }
    }
  }

  #populatePageNumberButtons() {
    let pageNumberHtml = '';
    const pageCount = this.pageCount;
    if (!pageCount) {
      return;
    }
    for (let n = 1; n <= pageCount; n++) {
      pageNumberHtml += `<ids-button ${this.disabledOverall ? 'disabled' : ''}>${n}</ids-button>`;
    }

    this.container.innerHTML = pageNumberHtml;

    for (let n = 1; n <= pageCount; n++) {
      const numberButton = this.container.children[n - 1];
      numberButton.button.setAttribute('aria-label', `Go to page ${n}`);
      if (n === this.pageNumber) {
        numberButton.setAttribute(attributes.SELECTED, '');
      }

      numberButton.addEventListener('click', () => {
        this.triggerEvent('pagenumberchange', this, {
          bubbles: true,
          detail: { elem: this, value: n }
        });
      });
    }
  }
}
