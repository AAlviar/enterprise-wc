import { attributes } from '../../core/ids-attributes';
import { customElement, scss } from '../../core/ids-decorators';
import { stringToBool } from '../../utils/ids-string-utils/ids-string-utils';
import Base from './ids-rating-base';

import styles from './ids-rating.scss';

/**
 * IDS Rating Component
 * @type {IdsRating}
 * @inherits IdsElement
 * @mixes IdsEventsMixin
 * @mixes IdsKeyboardMixin
 * @mixes IdsThemeMixin
 */
@customElement('ids-rating')
@scss(styles)
export default class IdsRating extends Base {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.readonly) {
      this.#attachEventHandlers();
    } else {
      this.updateHalfStar(this.ratingArr);
    }
  }

  ratingArr = [...this.container.children];

  /**
   * Create the template for the rating contents
   * @returns {string} The template
   */
  template(): string {
    let html = '<div class="rating">';
    for (let i = 0; i < this.stars; i++) {
      html += `<ids-icon class="star star-${i}" role="button" aria-label="${i + 1} out of 5 Stars" icon="star-outlined" tabindex="0" size="${this.size}"></ids-icon>`;
    }
    html += '</div>';
    return html;
  }

  /**
   * @returns {Array<string>} this component's observable properties
   */
  static get attributes(): Array<string> {
    return [
      ...super.attributes,
      attributes.CLICKABLE,
      attributes.COMPACT,
      attributes.MODE,
      attributes.READONLY,
      attributes.SIZE,
      attributes.STARS,
      attributes.VALUE,
      attributes.VERSION
    ];
  }

  /**
   * Sets the value attribute
   * @param {string|number} val string value from the value attribute
   */
  set value(val: string | number | any) {
    const isReadonly = stringToBool(this.readonly);

    if (val && !isReadonly) {
      this.ratingArr.forEach((element) => {
        element.setAttribute('icon', 'star-outlined');
        element.classList.remove('is-half');
        element.classList.remove('active');
      });
      const valueArray = this.ratingArr;
      const starArray = valueArray.slice(0, parseInt(val));
      starArray.forEach((element) => {
        element.setAttribute('icon', 'star-filled');
        element.classList.add('active');
      });
      this.setAttribute('value', val.toString());
    }

    if (val && isReadonly) {
      this.ratingArr.forEach((element) => {
        element.setAttribute('icon', 'star-outlined');
        element.classList.remove('active');
        element.classList.remove('is-half');
      });
      this.updateHalfStar(this.ratingArr);
    }
  }

  get value(): number {
    return Number(this.getAttribute('value') || '0');
  }

  /**
   * Sets the stars attribute
   * @param {string} num string value from the stars attribute
   */
  set stars(num: string | number | any) {
    if (num) {
      this.setAttribute('stars', num.toString());
    }
  }

  get stars(): string | number | any {
    return this.getAttribute('stars') || 5;
  }

  /**
   * Sets the readonly attribute
   * @param {string} ro string value from the readonly attribute
   */
  set readonly(ro: string | boolean) {
    if (ro && this.readonly) {
      this.offEvent('click', this.container);
      this.updateHalfStar(this.ratingArr);
      this.setAttribute('readonly', ro.toString());
    }

    if (ro && !this.readonly) {
      this.#attachEventHandlers();
      this.setAttribute('readonly', ro.toString());
    }
  }

  get readonly(): string | boolean | any {
    return this.getAttribute('readonly') || false;
  }

  /**
   * Sets the size attribute
   * @param {string} s string value from the size attribute
   */
  set size(s: string) {
    if (s) {
      this.ratingArr.forEach((element) => element.setAttribute('size', s.toString()));
      this.setAttribute('size', s.toString());
    }
  }

  get size() {
    return this.getAttribute('size') || 'large';
  }

  /**
   * Handle events
   * @private
   * @returns {void}
   */
  #attachEventHandlers(): void {
    this.onEvent('click', this.container, (e: any) => this.updateStars(e));
    this.onEvent('keyup', this.container, (e: { key: string; }) => {
      if ((e.key === 'Enter' || e.key === ' ') && this.readonly === false) {
        this.updateStars(e);
      }
    });
  }

  /**
   * Sets star state, active class and icon attribute
   * @param {any} event event target
   */
  updateStars(event: any) {
    const activeElements = this.ratingArr.filter((item) => item.classList.contains('active'));
    let attrName = 'star-filled';
    let action = 'add';
    for (const ratingOption of this.ratingArr) {
      ratingOption.classList[action]('active');
      ratingOption.setAttribute('icon', attrName);
      if (ratingOption === event.target) {
        action = 'remove';
        attrName = 'star-outlined';
      }
      if (activeElements.length === 1 && event.target.classList.contains('star-0')) {
        activeElements[0].classList.remove('active');
        activeElements[0].setAttribute('icon', 'star-outlined');
      }
    }
    this.updateValue(this.ratingArr);
  }

  /**
   * Sets and updates value attribute
   * @param {any} arr NodeList
   */
  updateValue(arr: any) {
    const val = [...arr];
    const value = val.filter((el) => el.classList.contains('active'));
    this.setAttribute('value', value.length);
  }

  /**
   * Sets and updates value attribute for halfstar
   * @param {any} arr NodeList
   */
  updateHalfStar(arr: any) {
    const value = this.value;
    const roundValue = Math.round(value);
    for (let i = 0; i < roundValue; i++) {
      arr[i].classList.add('active');
      arr[i].setAttribute('icon', 'star-filled');
    }
    if (value < roundValue) {
      const activeArr = arr.filter((act: { classList: { contains: (arg0: string) => any; }; }) => act.classList.contains('active'));
      const lastItem = activeArr[activeArr.length - 1];
      lastItem.classList.add('is-half');
      lastItem.setAttribute('icon', 'star-half');
    }
  }
}
