import { customElement, IdsElement } from '../ids-base/ids-element';
import './ids-layout-grid.scss';

/**
 * IDS Column Component
 */
@customElement('ids-layout-column')
class IdsLayoutColumn extends IdsElement {
  constructor() {
    super();
  }

  connectedCallBack() {
    this.classList.add('ids-layout-column');
  }

  /**
   * Return the properties we handle as getters/setters
   * @returns {Array} The properties in an array
   */
  static get properties() {
    return ['fill'];
  }

  /**
   * Handle The Fill Setting
   * @returns {string} The fill color or true for theme default color
   */
  get fill() { return this.getAttribute('fill'); }

  /**
   * Set the background fill color
   * @param {string} value The fill color or true for theme default color
   */
  set fill(value) {
    const hasFill = this.hasAttribute('fill');

    if (hasFill && value) {
      this.setAttribute('fill', value);
      this.classList.add('ids-background-fill');
      return;
    }
    this.removeAttribute('fill');
    this.classList.remove('ids-background-fill');
  }
}