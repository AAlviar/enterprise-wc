import { customElement, scss } from '../../core/ids-decorators';
import { attributes } from '../../core/ids-attributes';
import Base from './ids-badge-base';

import styles from './ids-badge.scss';

/**
 * IDS Badge Component
 * @type {IdsBadge}
 * @inherits IdsElement
 * @mixes IdsEventsMixin
 * @mixes IdsThemeMixin
 * @part badge - the badge element
 */
@customElement('ids-badge')
@scss(styles)
export default class IdsBadge extends Base {
  constructor() {
    super();
  }

  /**
   * Return the attributes we handle as getters/setters
   * @returns {Array} The attributes in an array
   */
  static get attributes() {
    return [
      attributes.COLOR,
      attributes.MODE,
      attributes.SHAPE
    ];
  }

  /**
   * Create the Template for the contents
   * @returns {string} The Template
   */
  template() {
    const shape = this.shape;
    return `<span class="ids-badge ${shape}" part="badge"><slot></slot></span>`;
  }

  /**
   * Return the badge shape between normal and round
   * @returns {string} The path data
   */
  get shape(): string | null { return this.getAttribute('shape') || 'normal'; }

  /**
   * Set the shape of the badge
   * @param {string} value The Badge Shape
   */
  set shape(value: string | null) {
    if (value) {
      this.setAttribute('shape', value.toString());
    } else {
      this.removeAttribute('shape');
    }
    this.container.setAttribute('class', `ids-badge ${this.shape}`);
  }

  /**
   * Return the badge color
   * @returns {string | null} the path data
   */
  get color(): string | null { return this.getAttribute('color'); }

  /**
   * Set the color
   * @param {string | null} value The Badge Color [base, error, info, success and warning]
   */
  set color(value: string | null) {
    if (value) {
      this.setAttribute('color', value);
      this.container.setAttribute('color', value);
      let statusColor;
      this.container.style.backgroundColor = statusColor;
      this.container.style.borderColor = statusColor;

      if (value === 'error' || value === 'info' || value === 'warning') {
        this.container.classList.add('ids-white');
      }
    } else {
      this.removeAttribute('color');
      this.container.removeAttribute('color');
      this.container.style.backgroundColor = '';
      this.container.style.borderColor = '';
      this.container.style.color = '';
      this.container.style.position = '';
    }
  }
}
