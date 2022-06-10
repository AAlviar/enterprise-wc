import { customElement, scss } from '../../core/ids-decorators';
import { attributes } from '../../core/ids-attributes';
import Base from './ids-progress-chart-base';

import styles from './ids-progress-chart.scss';

// Defaults
const DEFAULT_PROGRESS = 0;
const DEFAULT_TOTAL = 100;
const DEFAULT_SIZE = 'normal';

/**
 * IDS Progress Chart Component
 * @type {IdsProgressChart}
 * @inherits IdsElement
 * @mixes IdsEventsMixin
 * @mixes IdsThemeMixin
 */
@customElement('ids-progress-chart')
@scss(styles)
export default class IdsProgressChart extends Base {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
  }

  /**
   * Return the attributes we handle as getters/setters
   * @returns {Array} The attributes in an array
   */
  static get attributes(): Array<string> {
    return [
      attributes.COLOR,
      attributes.ICON,
      attributes.LABEL,
      attributes.LABEL_PROGRESS,
      attributes.LABEL_TOTAL,
      attributes.PROGRESS,
      attributes.SIZE,
      attributes.TOTAL,
    ];
  }

  /**
   * Create the Template for the contents
   * @returns {string} The template
   */
  template(): string {
    return `<div class="ids-progress-chart" part="chart">
      <div class="labels">
        <ids-text class="label-main">${this.label || ''}</ids-text>
        <ids-icon class="icon" icon="${this.icon || ''}" size="${this.size || DEFAULT_SIZE}"></ids-icon>
        <ids-text class="label-progress">${this.progressLabel || ''}</ids-text>
        <div class="label-end">
          <ids-text class="label-total">${this.totalLabel || ''}</ids-text>
        </div>
      </div>
      <div class="bar">
        <div class="bar-total">
          <div class="bar-progress"></div>
        </div>
      </div>
    </div>`;
  }

  /**
   * Sets the icon inside the label
   * @param {string} value The icon name
   */
  set icon(value: string) {
    const icon = this.container.querySelector('.icon');
    if (value) {
      icon.style.display = '';
      icon.style.margin = '0 4px';
      this.setAttribute(attributes.ICON, value);
      icon.setAttribute(attributes.ICON, value);
    } else {
      icon.style.display = 'none';
      this.setAttribute(attributes.ICON, '');
      icon.setAttribute(attributes.ICON, '');
    }
  }

  get icon(): string { return this.getAttribute(attributes.ICON); }

  /**
   * Set the color of the bar
   * @param {string} value The color value, this can be a hex code with the #
   */
  set color(value: string) {
    this.setAttribute(attributes.COLOR, value);
    this.#updateColor();
  }

  get color(): string { return this.getAttribute(attributes.COLOR); }

  /**
   * Updates the UI when color attribute is set
   * @private
   */
  #updateColor(): void {
    let prop = this.color;

    const includesAlert = this.color.includes('error') || this.color.includes('caution') || this.color.includes('warning');

    if (includesAlert || this.color.includes('base') || this.color.includes('success')) {
      prop = `var(--ids-color-status-${this.color === 'error' ? 'danger' : this.color})`;

      // only color the icons and progress labels if it's error, caution, or warning
      if (includesAlert) {
        const progressLabel = this.container.querySelector('.label-progress');
        progressLabel.style.color = prop;

        const icon = this.container.querySelector('ids-icon');
        icon.style.color = prop;
      }
    } else if (this.color.substring(0, 1) !== '#') {
      prop = `var(--ids-color-palette-${this.color})`;
    }

    const bar = this.container.querySelector('.bar-progress');
    bar.style.backgroundColor = prop;
  }

  /**
   * Updates the UI when the main/progress/total label is set
   * @param {string} labelType The type of label being set
   * @private
   */
  #updateLabel(labelType: string): void {
    if (labelType === attributes.LABEL) {
      this.container.querySelector('.label-main').innerHTML = this.label;
    } else if (labelType === attributes.LABEL_PROGRESS) {
      this.container.querySelector('.label-progress').innerHTML = this.progressLabel;
    } else {
      this.container.querySelector('.label-total').innerHTML = this.totalLabel;
    }
  }

  /**
   * Updates the UI when the progress value/total is set
   * @private
   */
  #updateProgress(): void {
    const prog = parseFloat(this.progress) || DEFAULT_PROGRESS;
    const tot = parseFloat(this.total) || DEFAULT_TOTAL;
    // make sure that prog / tot doesn't exceed 1 -- will happen if prog > tot
    const percentage = Math.floor((prog / tot > 1 ? 1 : prog / tot) * 100);
    this.percentage = percentage;
    this.container.querySelector('.bar-progress').style.width = `${percentage}%`;
  }

  /**
   * Updates the UI when the chart size is set
   * @private
   */
  #updateSize(): void {
    const bar = this.container.querySelector('.bar');
    bar.style.minHeight = this.size === 'small' ? '10px' : '28px';
    bar.style.borderRadius = this.size === 'small' ? '0px' : '2px';
  }

  /**
   * Set the numeric value of progress that has been completed
   * @param {string} value The progress value, between 0 and the total
   */
  set progress(value: string) {
    const prop = (parseFloat(value) < 0 || Number.isNaN(parseFloat(value)))
      ? DEFAULT_PROGRESS
      : value;

    this.setAttribute(attributes.PROGRESS, prop);
    this.#updateProgress();
  }

  get progress(): string { return this.getAttribute(attributes.PROGRESS); }

  /**
   * Set the total value of possible progress that can be completed
   * @param {string} value The total value, must be greater than or equal to the progress value
   */
  set total(value: string) {
    const prop = (parseFloat(value) < 0 || Number.isNaN(parseFloat(value)))
      ? DEFAULT_TOTAL
      : value;

    this.setAttribute(attributes.TOTAL, prop);
    this.#updateProgress();
  }

  get total(): string { return this.getAttribute(attributes.TOTAL); }

  /**
   * Set the label title of the bar
   * @param {string} value The title value, whatever you want to name the bar
   */
  set label(value: string) {
    this.setAttribute(attributes.LABEL, value || '');
    this.#updateLabel(attributes.LABEL);
  }

  get label(): string { return this.getAttribute(attributes.LABEL); }

  /**
   * Set the label of completed progress--useful for displaying units
   * @param {string} value The label for completed progress (i.e. 13 hours)
   */
  set progressLabel(value: string) {
    this.setAttribute(attributes.LABEL_PROGRESS, value || '');
    this.#updateLabel(attributes.LABEL_PROGRESS);
  }

  get progressLabel(): string { return this.getAttribute(attributes.LABEL_PROGRESS); }

  /**
   * Set the label of total possible progress--useful for displaying units
   * @param {string} value The label for total progress (i.e. 26 hours)
   */
  set totalLabel(value: string) {
    this.setAttribute(attributes.LABEL_TOTAL, value || '');
    this.#updateLabel(attributes.LABEL_TOTAL);
  }

  get totalLabel(): string { return this.getAttribute(attributes.LABEL_TOTAL); }

  /**
   * Set the size of the progress bar (small, or normal (default)
   * @param {string} value The size of the progress bar
   */
  set size(value: string) {
    const prop = value === 'small' ? value : DEFAULT_SIZE;
    this.setAttribute(attributes.SIZE, prop);
    const icon = this.container.querySelector('.icon');
    icon.setAttribute('size', prop);
    this.#updateSize();
  }

  get size(): string { return this.getAttribute(attributes.SIZE); }
}
