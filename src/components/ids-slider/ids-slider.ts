import { customElement, scss } from '../../core/ids-decorators';
import { attributes } from '../../core/ids-attributes';
import { stringToBool } from '../../utils/ids-string-utils/ids-string-utils';
import Base from './ids-slider-base';

import styles from './ids-slider.scss';

const TYPES = [
  'single',
  'double',
  'step'
];

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const DEFAULT_TYPE = TYPES[0];

/**
 * IDS Slider Component
 * @type {IdsSlider}
 * @inherits IdsElement
 * @mixes IdsEventsMixin
 * @mixes IdsThemeMixin
 * @mixes IdsLocaleMixin
 */
@customElement('ids-slider')
@scss(styles)
export default class IdsSlider extends Base {
  DEFAULT_MIN = DEFAULT_MIN;

  DEFAULT_MAX = DEFAULT_MAX;

  DEFAULT_TYPE = DEFAULT_TYPE;

  #trackBounds: any;

  #labels: any;

  #isRTL: any;

  #mouseHover: any;

  #percent: any;

  #percentSecondary: any;

  slider: any;

  trackArea: any;

  progressTrack: any;

  track: any;

  tickContainer: any;

  thumb: any;

  thumbDraggable: any;

  thumbShadow: any;

  tooltip: any;

  tooltipText: any;

  tooltipPin: any;

  firstTick: any;

  lastTick: any;

  thumbSecondary: any;

  thumbDraggableSecondary: any;

  thumbShadowSecondary: any;

  tooltipSecondary: any;

  tooltipTextSecondary: any;

  tooltipPinSecondary: any;

  constructor() {
    super();
  }

  connectedCallback() {
    this.slider = this.container.querySelector('.slider');
    this.trackArea = this.container.querySelector('.track-area');
    this.progressTrack = this.container.querySelector('.track-progress');
    this.track = this.container.querySelector('.track');
    this.tickContainer = this.container.querySelector('.tick-container');

    this.#mouseHover = false;
    this.thumb = this.container.querySelector('.thumb');
    this.thumbDraggable = this.container.querySelector('.thumb-draggable');
    this.thumbShadow = this.container.querySelector('.thumb-shadow');
    this.tooltip = this.container.querySelector('.tooltip');
    this.tooltipText = this.container.querySelector('.tooltip .text');
    this.tooltipPin = this.container.querySelector('.tooltip .pin');
    this.lastTick = this.container.querySelector('.tick:last-child');
    this.firstTick = this.container.querySelector('.tick:first-child');

    if (this.type === 'double') {
      this.thumbSecondary = this.container.querySelector('.thumb.secondary');
      this.thumbDraggableSecondary = this.container.querySelector('.thumb-draggable.secondary');
      this.thumbShadowSecondary = this.container.querySelector('.thumb-shadow.secondary');
      this.tooltipSecondary = this.container.querySelector('.tooltip.secondary');
      this.tooltipTextSecondary = this.container.querySelector('.tooltip.secondary .text.secondary');
      this.tooltipPinSecondary = this.container.querySelector('.tooltip .pin.secondary');
    } else {
      this.container.querySelector('.thumb-draggable.secondary').remove();
    }

    this.#attachEventListeners();
    this.#initUIStyles();
    super.connectedCallback();
  }

  /**
   * Return the attributes we handle as getters/setters
   * @returns {Array} The attributes in an array
   */
  static get attributes(): Array<any> {
    return [
      attributes.COLOR,
      attributes.MIN,
      attributes.MAX,
      attributes.STEP_NUMBER,
      attributes.TYPE,
      attributes.VALUE,
      attributes.VALUE_SECONDARY,
      attributes.VERTICAL,
    ];
  }

  /**
   * Create the Template for the contents
   * @returns {string} The template
   */

  template(): string {
    return `
      <div class="ids-slider">
        <div class="slider">
          <div class="track-area">
            <ids-draggable hidden tabindex="0" class="thumb-draggable" axis="${this.vertical ? 'y' : 'x'}" parent-containment>
              <div hidden class="thumb-shadow"></div>
              <div class="thumb">
                <div class="tooltip">
                  <ids-text class="text">${this.value}</ids-text>
                  <div class="pin"></div>
                </div>
              </div>
            </ids-draggable>
            <ids-draggable hidden tabindex="0" class="thumb-draggable secondary" axis="${this.vertical ? 'y' : 'x'}" parent-containment>
              <div hidden class="thumb-shadow secondary"></div>
              <div class="thumb secondary">
                <div class="tooltip secondary">
                  <ids-text class="text secondary">${this.valueSecondary}</ids-text>
                  <div class="pin secondary"></div>
                </div>
              </div>
            </ids-draggable>
          </div>
          <div class="track">
          <div class="track-progress"></div>
            <div class="tick-container">
              <span class="tick"></span>
              <span class="tick"></span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Set the orientation of the slider
   * @param {boolean} value Whether the orientation is vertical or horizontal
   */
  set vertical(value: boolean) {
    const val = stringToBool(value);
    if (val) {
      this.setAttribute(attributes.VERTICAL, val);
    } else {
      this.removeAttribute(attributes.VERTICAL);
    }
    if (val) {
      this.container.classList.add('vertical');
      this.slider.classList.add('vertical');
      this.progressTrack.classList.add('vertical');
      this.track.classList.add('vertical');
      this.trackArea.classList.add('vertical');
      this.tickContainer.classList.add('vertical');
      this.tooltip.classList.add('vertical');
      if (this.type === 'double') this.tooltipSecondary.classList.add('vertical');
      this.tooltipPin.classList.add('vertical');
      if (this.type === 'double') this.tooltipPinSecondary.classList.add('vertical');
    }
  }

  get vertical() {
    return this.hasAttribute(attributes.VERTICAL);
  }

  /**
   * Keep track of RTL
   * @param {boolean} value Whether or not RTL is in effect
   */
  set isRTL(value: boolean) {
    if (value !== this.isRTL) {
      this.#isRTL = value;
      this.#moveThumb();
      this.#updateProgressBar();
      if (this.type === 'double') this.#moveThumb('secondary');
    }
  }

  get isRTL() {
    if (typeof this.#isRTL === 'undefined') this.#isRTL = false;
    return this.#isRTL;
  }

  /** Add event listener for when the language changes to check for RTL */
  #attachRTLListener() {
    this.onEvent('languagechange.container', this.closest('ids-container'), (e: CustomEvent) => {
      const isRTL = this.locale.isRTL(e.detail.language.name);
      this.isRTL = isRTL;
    });
  }

  /**
   * Helper method to update the UI of the tooltip and its text
   * @param {number} value the text the tooltip should display
   * @param {string} primaryOrSecondary which tooltip to update
   */
  #updateTooltip(value?: number, primaryOrSecondary?: string) {
    let tooltipText = this.tooltipText;
    let type = 'primary';

    if (primaryOrSecondary === 'secondary') {
      tooltipText = this.tooltipTextSecondary;
      type = 'secondary';
    }

    tooltipText.innerHTML = Math.ceil(Number(value));

    if (this.type !== 'step') {
      this.#updateTooltipDisplay(false, type);
    }
  }

  /** Helper method to update the UI of the progress track bar */
  #updateProgressBar() {
    if (this.type !== 'double') {
      this.slider.style.setProperty('--percentStart', 0);
      this.slider.style.setProperty('--percentEnd', this.percent);
    } else {
      const minPercent = Math.min(this.percent, this.percentSecondary);
      const maxPercent = Math.max(this.percent, this.percentSecondary);
      this.slider.style.setProperty('--percentStart', minPercent);
      this.slider.style.setProperty('--percentEnd', maxPercent);

      if (this.#trackBounds) {
        const {
          TOP,
          BOTTOM,
          LEFT,
          RIGHT
        } = this.#trackBounds;

        const startPos = this.vertical ? BOTTOM : LEFT;
        const endPos = this.vertical ? TOP : RIGHT;
        const centered = false;
        let trans = this.#calcTranslateFromPercent(startPos, endPos, minPercent, centered);
        if (this.vertical || this.isRTL) { trans *= -1; }
        const transString = this.vertical ? `translate(0, ${trans}px)` : `translate(${trans}px, 0)`;
        this.progressTrack.style.transform = transString;
      }
    }
  }

  /**
   * Set the labels to display on each step/tick mark (only applicable to step sliders)
   * @param {Array} array the list of labels to set
   */
  set labels(array) {
    this.#labels = array;
    this.#setStepLabels();
  }

  get labels() {
    return this.#labels;
  }

  /** Helper method to update the labels on the UI according to stepNumber and labels */
  #setStepLabels() {
    if (this.type !== 'step') return;

    const labels = this.labels;
    const stepNumber = this.stepNumber;

    // check to make sure labels length is equal to step number

    if (labels.length === stepNumber) {
      // check amount of label elements -- add or remove accordingly
      let labelElements = this.container.querySelectorAll('.label');
      const ticks = this.container.querySelectorAll('.tick');

      if (labelElements.length !== stepNumber) {
        const x = Math.abs(stepNumber - labelElements.length);
        for (let i = 0; i < x; i++) {
          if (labelElements.length < stepNumber) {
            ticks[ticks.length - 1 - i].insertAdjacentHTML('afterbegin', '<ids-text label class="label"></ids-text>');
          }
        }
        // grab fresh label elements group
        labelElements = this.container.querySelectorAll('.label');
      }
      // set the innerHTML for each label in the array

      if (labels.length === labelElements.length) {
        labelElements.forEach((x: { innerHTML: any; classList: { add: (arg0: string) => any; }; }, i: number) => {
          x.innerHTML = this.vertical ? labels[labels.length - 1 - i] : labels[i];
          if (this.vertical) x.classList.add('vertical'); // add vertical styles
        });
      }
    } else {
      // set labels to be empty
      const labelElements = this.container.querySelectorAll('.label');
      labelElements.forEach((x: { innerHTML: string; }) => {
        x.innerHTML = '';
      });
    }
  }

  /**
   * Helper method for setLabels and initialization of labels
   * @returns {Array} An array the size of stepNumber with numerical intervals between the min and max
   */
  #generateNumericalLabels(): Array<any> {
    const arr = [];
    for (let i = 0; i < this.stepNumber; i++) {
      // rounds floats to 1st decimal
      arr[i] = Math.round(((this.max / (this.stepNumber - 1)) * i) * 10) / 10;
    }
    return arr;
  }

  /**
   * Set the amount of step intervals desired (only applicable to step sliders)
   * @param {string} value the amount of steps
   */
  set stepNumber(value: string | number | any) {
    if (this.type === 'step') {
      // must have at least 2 steps

      if (parseInt(value) >= 2) {
        this.setAttribute('step-number', value);
        const stepLength = this.container.querySelectorAll('.tick').length;

        if (stepLength !== this.stepNumber) {
          const x = Math.abs(stepLength - this.stepNumber);
          for (let i = 0; i < x; i++) {
            // remove or add ticks accordingly
            if (stepLength > this.stepNumber) {
              this.container.querySelector('.tick').remove();
            } else {
              this.container.querySelector('.tick:last-child').insertAdjacentHTML('afterend', '<span class="tick"></span>');
            }
          }
        }
      }
      this.labels = this.#generateNumericalLabels();
    } else {
      this.removeAttribute('step-number');
    }
  }

  get stepNumber() { return parseInt(this.getAttribute('step-number')) || 2; }

  /** Tracks the secondary percent based on the value, min, and max */
  set percentSecondary(value) {
    this.#percentSecondary = value;
    this.#updateProgressBar();
    this.#updateTooltip(this.#calcValueFromPercent(value), 'secondary');
  }

  get percentSecondary() {
    // we need all these checks so that it still works with 0
    if (Number.isNaN(this.#percentSecondary) || typeof this.#percentSecondary === 'undefined' || this.#percentSecondary === null || this.#percentSecondary === '') {
      // calculate on the fly if not a valid number
      return ((this.valueSecondary - this.min) / (this.max - this.min)) * 100;
    }
    return this.#percentSecondary;
  }

  /** Tracks the percent based on the value, min, and max */
  set percent(value) {
    this.#percent = value;
    this.#updateProgressBar();
    this.#updateTooltip(this.#calcValueFromPercent(value));
  }

  get percent() {
    if (Number.isNaN(this.#percent) || typeof this.#percent === 'undefined' || this.#percent === null || this.#percent === '') {
      return ((this.value - this.min) / (this.max - this.min)) * 100;
    }
    return this.#percent;
  }

  /**
   * Helper function to check if values being set are within min and max
   * @param {number} value the number to check
   * @returns {boolean} whether it is within range of the min and max
   */
  #withinBounds(value: string | number | any): boolean {
    return parseFloat(value) >= this.min && parseFloat(value) <= this.max;
  }

  /**
   * Set the secondary value of the slider (only applicable to double sliders)
   * @param {string} value The secondary input value
   */
  set valueSecondary(value: string | number | any) {
    if (this.#withinBounds(value)) {
      this.setAttribute(attributes.VALUE_SECONDARY, value);
      this.percentSecondary = ((this.valueSecondary - this.min) / (this.max - this.min)) * 100;
      this.#updateTooltip(value, 'secondary');
      this.#moveThumb('secondary');
    } else if (value < this.min) {
      this.setAttribute(attributes.VALUE_SECONDARY, this.min);
    } else {
      this.setAttribute(attributes.VALUE_SECONDARY, this.max);
    }
  }

  get valueSecondary(): number {
    const b = this.getAttribute(attributes.VALUE_SECONDARY);
    if (b === null || b === '' || Number.isNaN(b)) {
      return this.max;
    }
    return parseFloat(this.getAttribute(attributes.VALUE_SECONDARY));
  }

  /**
   * Set the primary value of the slider
   * @param {string} value The input value
   */
  set value(value: string | number | any) {
    if (this.#withinBounds(value)) {
      this.setAttribute(attributes.VALUE, value);
      this.percent = ((this.value - this.min) / (this.max - this.min)) * 100;
      this.#updateTooltip(value);
      this.#moveThumb('');
    } else if (value > this.max) {
      this.setAttribute(attributes.VALUE, this.max);
    } else {
      this.setAttribute(attributes.VALUE, this.min);
    }
  }

  get value() {
    const a = this.getAttribute(attributes.VALUE);
    if (a === null || a === '' || Number.isNaN(a)) {
      return this.min;
    }
    return parseFloat(this.getAttribute(attributes.VALUE));
  }

  /**
   * Set the minimum value of the slider
   * @param {string} value The desired minimum
   */
  set min(value: string | number | any) {
    const val: any = parseFloat(value);
    if (val >= this.max || val === null || val === '' || Number.isNaN(val)) {
      this.setAttribute(attributes.MIN, DEFAULT_MIN);
    } else {
      this.setAttribute(attributes.MIN, val);
    }
  }

  get min() {
    return parseFloat(this.getAttribute(attributes.MIN)) || DEFAULT_MIN;
  }

  /**
   * Set the maximum value of the slider
   * @param {string} value The desired max
   */
  set max(value: string | number | any) {
    const val: any = parseFloat(value);
    if (val <= this.min || val === null || val === '' || Number.isNaN(val)) {
      this.setAttribute(attributes.MAX, this.min + DEFAULT_MAX);
    } else {
      this.setAttribute(attributes.MAX, val);
    }
  }

  get max() {
    const val: any = parseFloat(this.getAttribute(attributes.MAX));
    if (val <= this.min || val === null || val === '' || Number.isNaN(val)) {
      return DEFAULT_MAX;
    }
    return val;
  }

  /**
   * Set the type of the bar
   * @param {string} value The type of slider
   */
  set type(value: string) {
    if (value && TYPES.includes(value)) {
      this.setAttribute(attributes.TYPE, value);
    } else {
      this.setAttribute(attributes.TYPE, DEFAULT_TYPE);
    }
  }

  get type(): string { return this.getAttribute(attributes.TYPE) || DEFAULT_TYPE; }

  /**
   * Set the color of the bar
   * @param {string} value The color, this can be a hex code with the #, a native css color, or an ids-status color
   */
  set color(value) {
    this.setAttribute(attributes.COLOR, value);
    this.#updateColor();
  }

  get color() { return this.getAttribute(attributes.COLOR); }

  /** Update the color theme of the slider */
  #updateColor() {
    const color = this.color;

    if (color) {
      const ticks = this.container.querySelectorAll('.tick');

      let colorString = color;

      if (color.substring(0, 1) !== '#') {
        if (color.includes('error') || color.includes('warning') || color.includes('caution') || color.includes('base') || color.includes('success')) {
          colorString = `var(--ids-color-status-${color === 'error' ? 'danger' : color})`;
        }
      }

      ticks.forEach((tick: { style: { setProperty: (arg0: string, arg1: any) => void; }; }) => {
        tick.style.setProperty('background-color', colorString);
      });
      this.thumb.style.setProperty('background-color', colorString);
      const rgbString = window.getComputedStyle(this.thumb).backgroundColor;
      // have to specify opacity in background-color, otherwise the opacity affects the ring border
      const rgbaString = `${rgbString.slice(0, 3)}a${rgbString.slice(3, rgbString.length - 1)}, 0.1)`;
      this.thumbShadow.style.setProperty('background-color', rgbaString);
      this.thumbShadow.style.setProperty('border', `1px ${colorString} solid`);
      this.progressTrack.style.setProperty('background-color', colorString);

      if (this.type === 'double' && this.thumbShadowSecondary && this.thumbSecondary) {
        this.thumbShadowSecondary.style.setProperty('background-color', rgbaString);
        this.thumbShadowSecondary.style.setProperty('border', `1px ${colorString} solid`);
        this.thumbSecondary.style.setProperty('background-color', colorString);
      }
    }
  }

  /**
   * Hide/show the tooltip of the value
   * @param {boolean} hide whether or not to hide it
   * @param {primaryOrSecondary} primaryOrSecondary which tooltip to hide
   */
  #updateTooltipDisplay(hide: boolean, primaryOrSecondary?: string) {
    if (primaryOrSecondary === 'secondary' && this.tooltipSecondary) {
      this.tooltipSecondary.style.opacity = hide ? 0 : 1;
    } else {
      this.tooltip.style.opacity = hide ? 0 : 1;
    }
  }

  /**
   * Hide/show the spotlight/box-shadow of the thumb
   * @param {boolean} hide whether or not to hide it
   * @param {string} primaryOrSecondary which thumb to hide
   */
  #updateThumbShadow(hide: boolean, primaryOrSecondary: string) {
    let thumbShadow = this.thumbShadow;

    if (primaryOrSecondary === 'secondary' && this.thumbShadowSecondary) {
      thumbShadow = this.thumbShadowSecondary;
    }

    if (hide) {
      thumbShadow.setAttribute('hidden', '');
    } else {
      thumbShadow.removeAttribute('hidden');
    }
  }

  /**
   * Helper method to calculate the percentage of slider from mouse click; not a pure function
   * @param {number} x coordinate of mouse click
   * @param {number} y coordinate of mouse click
   * @returns {number} the percent
   */
  #calcPercentFromClick(x: number, y: number): number {
    this.#refreshTrackBounds();
    const {
      TOP,
      BOTTOM,
      LEFT,
      RIGHT
    } = this.#trackBounds;

    const mousePos = this.vertical ? y : x;
    const horizontalStart = this.isRTL ? RIGHT : LEFT;
    const horizontalEnd = this.isRTL ? LEFT : RIGHT;
    const startPos = this.vertical ? BOTTOM : horizontalStart;
    const endPos = this.vertical ? TOP : horizontalEnd;

    const percent = this.#calcPercentFromRange(mousePos, startPos, endPos);

    return percent;
  }

  /**
   * Perform the calculations to update the UI and value(s)/percent(s) accordingly
   * @param {number} x coordinate of mouse click
   * @param {number} y coordnate of mouse click
   * @param {number} labelValueClicked if label was clicked or not
   */
  #calculateUIFromClick(x: number, y: number, labelValueClicked?: number) {
    if (this.type !== 'step') {
      const value = labelValueClicked ?? this.#calcValueFromPercent(this.#calcPercentFromClick(x, y));

      const thumbPos = this.vertical
        ? this.thumbDraggable.getBoundingClientRect().y
        : this.thumbDraggable.getBoundingClientRect().x;

      let thumbDraggable = this.thumbDraggable;
      let valueAttribute = 'value';

      if (this.type === 'double') {
        const thumbPosSecondary = this.vertical
          ? this.thumbDraggableSecondary.getBoundingClientRect().y
          : this.thumbDraggableSecondary.getBoundingClientRect().x;

        // figure out which thumb is closer to the click location
        const mousePos = this.vertical ? y : x;

        if (Math.abs(mousePos - thumbPos) > Math.abs(mousePos - thumbPosSecondary)) {
          thumbDraggable = this.thumbDraggableSecondary;
          valueAttribute = 'valueSecondary';
        }
      }

      this[valueAttribute] = value;
      thumbDraggable.focus();
    } else {
      // for step sliders, snap to the closest interval
      const arr = [];

      for (let i = 0; i < this.stepNumber; i++) {
        arr[i] = (this.max / (this.stepNumber - 1)) * i;
      }

      const percent = this.#calcPercentFromClick(x, y);
      const differences = arr.map((val) => Math.abs(val - ((percent / 100) * this.max)));

      let min = differences[0];
      let minIndex = 0;

      for (let i = 0; i < differences.length; i++) {
        if (differences[i] < min) {
          min = differences[i];
          minIndex = i;
        }
      }

      this.value = arr[minIndex];
      this.thumbDraggable.focus();
    }
  }

  /**
   * Translate the thumb(s) according to the percent values
   * @param {string} primaryOrSecondary which thumb to move
   */
  #moveThumb(primaryOrSecondary?: string) {
    this.#refreshTrackBounds();

    let thumbDraggable = this.thumbDraggable;
    let percent = this.percent;

    // secondary values
    if (primaryOrSecondary === 'secondary' && this.type === 'double') {
      thumbDraggable = this.thumbDraggableSecondary;
      percent = this.percentSecondary;
    }

    const {
      TOP,
      BOTTOM,
      LEFT,
      RIGHT
    } = this.#trackBounds;

    const startPos = this.vertical ? BOTTOM : LEFT;
    const endPos = this.vertical ? TOP : RIGHT;
    const centered = true;
    let trans = this.#calcTranslateFromPercent(startPos, endPos, percent, centered);

    if (this.vertical || this.isRTL) { trans *= -1; }
    const transString = this.vertical ? `translate(0, ${trans}px)` : `translate(${trans}px, 0)`;
    thumbDraggable.style.transform = transString;
  }

  /**
   * Calculate the true value based on the percent value
   * @param {number} percent the percent value to convert to numerical value btw min and max
   * @returns {number} the calculated value
   */
  #calcValueFromPercent(percent: number): number {
    return ((percent / 100) * (this.max - this.min)) + (this.min);
  }

  /**
   * Calculate the pixels to translate thumb(s) or progress track based on percent value
   * @param {number} nStart the starting x or y coordinate of the slider
   * @param {number} nEnd the ending x or y coordinate of the slider
   * @param {number} percent the percent/location of the thumb relative to the slider
   * @param {boolean} centered whether or not the thumb(s) or progress track is centered or not
   * if notCentered is true, it will translate from 0
   * if notCentered is false, it will translate negatively and positively with 0 being the center
   * @returns {number} coordinates or the amount of pixels to translate by
   */
  #calcTranslateFromPercent(nStart: number, nEnd: number, percent: number, centered: boolean): number {
    // minus thumb height bc it overshoots
    const editedRange = Math.abs(nEnd - nStart) - this.thumbDraggable.clientWidth;
    let coord = (Math.ceil(percent) / 100) * editedRange;
    coord = centered ? coord - (editedRange / 2) : coord;

    return coord;
  }

  /**
   * Calculate the percent value based on mouse click location
   * @param {number} n the mouse x or y coordinate
   * @param {number} nStart the starting x or y coordinate of the slider
   * @param {number} nEnd the ending x or y coordinate of the slider
   * @returns {number} the percent/location of the thumb relative to the slider
   */
  #calcPercentFromRange(n: number, nStart: number, nEnd: number): number {
    const thumbWidth = this.thumbDraggable.clientWidth;
    let percent = 0;
    // allow bigger hit areas for controlling thumb
    const range = Math.abs(nStart - nEnd) - thumbWidth / 2;
    const endDelta = Math.abs(n - nEnd);
    const startDelta = Math.abs(n - nStart);
    if (endDelta > range) {
      percent = 0;
    } else if (startDelta > range) {
      percent = 100;
    } else {
      percent = ((startDelta - thumbWidth / 2) / (range - thumbWidth / 2)) * 100;
    }
    return percent;
  }

  /** Attach all the necessary event listeners */
  #attachEventListeners() {
    // CHECK IF RTL
    this.#attachRTLListener();

    // RESIZE OBSERVER for when window size changes
    this.#attachResizeObserver();

    // DRAGGABLE EVENTS
    this.#attachDragEventListeners();
    if (this.type === 'double') this.#attachDragEventListeners('secondary');

    this.onEvent('mouseenter', this, () => {
      this.#mouseHover = true;
    });

    this.onEvent('mouseleave', this, () => {
      this.#mouseHover = false;
    });

    // FOCUS/BLUR EVENTS
    this.onEvent('focusin', this.container, (e: FocusEvent) => {
      if (this.shadowRoot.activeElement) {
        this.#updateTooltipDisplay(false);
        const target = e.target instanceof HTMLElement && e.target;

        if (target && target.classList.contains('secondary')) {
          this.#updateThumbShadow(false, 'secondary');
          this.#updateThumbShadow(true, 'primary');
        } else {
          this.#updateThumbShadow(false, 'primary');
          if (this.type === 'double') {
            this.#updateThumbShadow(true, 'secondary');
          }
        }

        if (this.type === 'double') {
          this.#updateTooltipDisplay(false, 'secondary');
        }
      }
    });

    this.onEvent('focusout', this.container, () => {
      if (!this.shadowRoot.activeElement && !this.#mouseHover) {
        this.#updateTooltipDisplay(true);
        this.#updateThumbShadow(true, 'primary');
        if (this.type === 'double') {
          this.#updateTooltipDisplay(true, 'secondary');
          this.#updateThumbShadow(true, 'secondary');
        }
      }
    });

    // KEYBOARD EVENTS
    this.#attachKeyboardListeners();

    // CLICK EVENTS
    this.#attachClickListeners();
  }

  /**
   * Calculates the x,y coordinates of the bounding box of the clickable track area
   * @returns {object} The track area boundaries
   */
  #calculateTrackBounds() {
    const rect = this.trackArea.getBoundingClientRect();
    const LEFT = rect.left + window.scrollX;
    const TOP = rect.top + window.scrollY;
    const RIGHT = LEFT + this.trackArea.clientWidth;
    const BOTTOM = TOP + this.trackArea.clientHeight;

    const bounds = {
      LEFT,
      RIGHT,
      TOP,
      BOTTOM,
    };

    return bounds;
  }

  #toggleTransitionStyles(toggleOn: any) {
    if (toggleOn) {
      // primary styles
      if (!this.thumbDraggable.style.transition && !this.progressTrack.style.transition) {
        this.thumbDraggable.style.setProperty('transition', 'transform 0.2s ease 0s');
        // the progress track transition animation is jittery on vertical and double sliders, so don't add for those
        if (!this.vertical || this.type !== 'double') this.progressTrack.style.setProperty('transition', 'width 0.2s ease 0s, transform 0.2s ease 0s');
      }
      // secondary styles
      if (this.type === 'double' && this.thumbDraggableSecondary && !this.thumbDraggableSecondary.style.transition) {
        this.thumbDraggableSecondary.style.setProperty('transition', 'transform 0.2s ease');
      }
    } else {
      this.thumbDraggable.style.removeProperty('transition');
      this.progressTrack.style.removeProperty('transition');

      if (this.type === 'double') this.thumbDraggableSecondary.style.removeProperty('transition');
    }
  }

  /** Performs initializations, like style set ups */
  #initUIStyles() {
    // init UI styles
    this.#updateProgressBar();
    this.#moveThumb();
    if (this.type === 'double') this.#moveThumb('secondary');
    this.#toggleTransitionStyles(true);
    this.#updateColor();

    // init base min/max labels

    if (this.firstTick && this.lastTick) {
      const maxTick = this.vertical ? this.firstTick : this.lastTick;
      const minTick = this.vertical ? this.lastTick : this.firstTick;

      minTick.innerHTML = `<ids-text label class="label${this.vertical ? ' vertical' : ''}">${this.min}</ids-text>`;
      maxTick.innerHTML = `<ids-text label class="label${this.vertical ? ' vertical' : ''}">${this.max}</ids-text>`;
    }
  }

  /**
   * Recalculates and updates the track bounds
   */
  #refreshTrackBounds() {
    this.#trackBounds = this.#calculateTrackBounds();
  }

  /** Checks if the window changes sizes and updates UI accordingly */
  #attachResizeObserver() {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentBoxSize) {
          this.#moveThumb();
          if (this.type === 'double') this.#moveThumb('secondary');
        }
      }
    });

    resizeObserver.observe(this.trackArea);
  }

  /** Add event listeners for clicking the track area */
  #attachClickListeners() {
    this.onEvent('click', this.container, (event: { target: { className: any; innerHTML: string; }; clientX: number; clientY: number; }) => {
      const className = event.target.className;
      const clickedIdsSlider = className.includes('ids-slider');
      const clickedLabel = className.includes('label');
      const clickedTrackArea = className.includes('track-area');

      if (clickedIdsSlider || clickedLabel || clickedTrackArea) {
        if (clickedTrackArea || clickedIdsSlider) {
          this.#calculateUIFromClick(event.clientX, event.clientY);
        } else {
          const labelValueClicked = parseFloat(event.target.innerHTML);
          this.#calculateUIFromClick(event.clientX, event.clientY, labelValueClicked);
        }
      }
    });

    this.onEvent('click', document, (event: any) => {
      if (event.target !== this) {
        this.#updateTooltipDisplay(true);
        if (this.type === 'double') this.#updateTooltipDisplay(true, 'secondary');
      }
    });
  }

  /**
   * Add event listeners for dragging the slider thumbs
   * @param {string} primaryOrSecondary the primary or secondary thumb
   */
  #attachDragEventListeners(primaryOrSecondary?: string) {
    const d = this.type === 'double' && primaryOrSecondary === 'secondary';
    const obj = {
      thumbDraggable: d ? this.thumbDraggableSecondary : this.thumbDraggable,
      thumbDraggableOther: d ? this.thumbDraggable : this.thumbDraggableSecondary,
      primaryOrSecondary: d ? 'secondary' : 'primary',
      valueAttribute: d ? 'valueSecondary' : 'value',
      percentAttribute: d ? 'percentSecondary' : 'percent'
    };

    const swapZIndex = () => {
      if (obj.thumbDraggableOther) {
        obj.thumbDraggableOther.style.zIndex = 50;
        obj.thumbDraggable.style.zIndex = 51;
      }
    };

    // Listen for drag event on draggable thumb
    this.onEvent('ids-drag', obj.thumbDraggable, (e: { detail: { mouseX: any; mouseY: any; }; }) => {
      if (this.type !== 'step') this.#updateTooltipDisplay(false);

      const [x, y] = [e.detail.mouseX, e.detail.mouseY];
      const percent = this.#calcPercentFromClick(x, y);

      if (this.type === 'double') swapZIndex();
      // only set the percent--because changing the value causes the moveThumb() to fire like crazy
      this[obj.percentAttribute] = percent;
    });

    this.onEvent('ids-dragstart', obj.thumbDraggable, () => {
      this.#toggleTransitionStyles(false);
      this.#updateThumbShadow(true, obj.primaryOrSecondary);
      this.#updateThumbShadow(true, obj.primaryOrSecondary === 'secondary' ? 'primary' : 'secondary');
    });

    this.onEvent('ids-dragend', obj.thumbDraggable, (e: CustomEvent) => {
      this.#toggleTransitionStyles(true);
      obj.thumbDraggable.focus();
      // to ensure that after dragging, the value is updated only after dragging has ended..
      // this is the roundabout solution to prevent the firing of moveThumb() every ids-drag event
      const freshPercent = obj.primaryOrSecondary === 'secondary' ? this.percentSecondary : this.percent;
      this.#calculateUIFromClick(e.detail.mouseX, e.detail.mouseY, freshPercent);
      this.#updateThumbShadow(false, obj.primaryOrSecondary);
    });
  }

  /** Add event listeners for arrow keys to move thumbs */
  #attachKeyboardListeners() {
    this.onEvent('keydown', this, (event: { code: string; preventDefault: () => void; target: { name: string; }; key: any; }) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(event.code) > -1) {
        event.preventDefault();
      }

      if (event.target.name === 'ids-slider') {
        let primaryOrSecondary = '';

        if (this.type === 'double') {
          // check if focus is on b or a
          if (this.thumbShadow.hasAttribute('hidden')) {
            primaryOrSecondary = 'secondary';
          }
        }

        switch (event.key) {
          case 'ArrowUp':
            this.#increaseValue(primaryOrSecondary);
            break;
          case 'ArrowDown':
            this.#decreaseValue(primaryOrSecondary);
            break;
          case 'ArrowRight':
            if (this.isRTL) this.#decreaseValue(primaryOrSecondary);
            else this.#increaseValue(primaryOrSecondary);
            break;
          case 'ArrowLeft':
            if (this.isRTL) this.#increaseValue(primaryOrSecondary);
            else this.#decreaseValue(primaryOrSecondary);
            break;
          default:
            break;
        }
      }
    });
  }

  /**
   * Helper method for arrow key actions
   * @param {string} primaryOrSecondary the primary or secondary value
   */
  #decreaseValue(primaryOrSecondary: string) {
    if (this.type === 'step') {
      this.value -= (this.max / (this.stepNumber - 1));
    } else if (this.type === 'double' && primaryOrSecondary === 'secondary') {
      this.valueSecondary = Math.ceil(this.valueSecondary) - 1;
    } else {
      this.value = Math.ceil(this.value) - 1;
    }
  }

  /**
   * Helper method for arrow key actions
   * @param {string} primaryOrSecondary the primary or secondary value
   */
  #increaseValue(primaryOrSecondary: string) {
    if (this.type === 'step') {
      this.value += (this.max / (this.stepNumber - 1));
    } else if (this.type === 'double' && primaryOrSecondary === 'secondary') {
      this.valueSecondary = Math.ceil(this.valueSecondary) + 1;
    } else {
      this.value = Math.ceil(this.value) + 1;
    }
  }
}
