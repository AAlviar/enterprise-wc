import fontSizes from 'ids-identity/dist/theme-new/tokens/web/ui.config.font-sizes';
import { attributes } from '../../core/ids-attributes';
import { customElement, scss } from '../../core/ids-decorators';
import { stringToBool } from '../../utils/ids-string-utils/ids-string-utils';
import { getClosest } from '../../utils/ids-dom-utils/ids-dom-utils';

import Base from './ids-text-base';

import styles from './ids-text.scss';

const fontWeightClasses = ['bold', 'lighter'];

// These types will have a CSS style class appended to them
const typesCssClasses = ['label', 'legend', 'span'];

/**
 * IDS Text Component
 * @type {IdsText}
 * @inherits IdsElement
 * @mixes IdsThemeMixin
 * @mixes IdsEventsMixin
 * @mixes IdsTooltipMixin
 * @mixes IdsLocaleMixin
 * @part text - the text element
 */
@customElement('ids-text')
@scss(styles)
export default class IdsText extends Base {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback?.();
    this.#attachEventHandlers();
  }

  /**
   * Return the attributes we handle as getters/setters
   * @returns {Array} The attributes in an array
   */
  static get attributes(): Array<string> {
    return [
      ...super.attributes,
      attributes.AUDIBLE,
      attributes.COLOR,
      attributes.DATA,
      attributes.DISABLED,
      attributes.DISPLAY,
      attributes.ERROR,
      attributes.FONT_SIZE,
      attributes.FONT_WEIGHT,
      attributes.LABEL,
      attributes.LANGUAGE,
      attributes.LOCALE,
      attributes.MODE,
      attributes.OVERFLOW,
      attributes.TRANSLATE_TEXT,
      attributes.TYPE,
      attributes.VERSION,
    ];
  }

  /**
   * Inner template contents
   * @returns {string} The template
   */
  template(): string {
    const tag = this.type || 'span';

    let classList = 'ids-text';
    classList += this.color === 'unset' ? ' ids-text-color-unset' : '';
    classList += (this.overflow === 'ellipsis') ? ' ellipsis' : '';
    classList += ((this.audible)) ? ' audible' : '';
    classList += this.fontSize ? ` ids-text-${this.fontSize}` : '';
    classList += (this.fontWeight === 'bold' || this.fontWeight === 'lighter')
      ? ` ${this.fontWeight}` : '';

    return `<${tag}
      class="${classList}"
      mode="${this.mode}"
      version="${this.version}"
      part="text"
    ><slot></slot>
    </${tag}>`;
  }

  /**
   * Inherited from `IdsColorVariantMixin`
   * @returns {Array<string>} List of available color variants for this component
   */
  colorVariants = ['alternate'];

  /**
   * Handle internal events
   * @private
   */
  #attachEventHandlers() {
    if (this.translateText) {
      this.offEvent('languagechange.text-container');
      this.onEvent('languagechange.text-container', getClosest((this as any), 'ids-container'), () => {
        this.#translateAsync();
      });
    }
  }

  /**
   * Set the font size of the text with a class.
   * @param {string | null} value The font size in the font scheme
   * i.e. 10, 12, 16 ect increasing by increments of 4
   */
  set fontSize(value: string | null) {
    fontSizes?.forEach((size: string) => {
      this.container?.classList.remove(`ids-text-${Object.keys(size)}`);
    });

    if (value) {
      this.setAttribute(attributes.FONT_SIZE, value);
      this.container?.classList.add(`ids-text-${value}`);
      return;
    }

    this.removeAttribute(attributes.FONT_SIZE);
  }

  get fontSize(): string | null { return this.getAttribute(attributes.FONT_SIZE); }

  /**
   * Adjust font weight; can be either "bold" or "lighter"
   * @param {string | null} value (if bold)
   */
  set fontWeight(value: string | null) {
    let hasValue = false;

    switch (value) {
      case 'bold':
      case 'lighter':
        hasValue = true;
        break;
      default:
        break;
    }

    this.container?.classList.remove(...fontWeightClasses);

    if (hasValue) {
      this.setAttribute(attributes.FONT_WEIGHT, value);
      this.container?.classList.add(value);
      return;
    }

    this.removeAttribute(attributes.FONT_WEIGHT);
  }

  get fontWeight(): string | null {
    return this.getAttribute(attributes.FONT_WEIGHT);
  }

  /**
   * Set the type of element it is (h1-h6, span (default))
   * @param {string | null} value  The type of element
   */
  set type(value: string | null) {
    if (value) {
      this.setAttribute(attributes.TYPE, value);
    } else {
      this.removeAttribute(attributes.TYPE);
    }

    this.render();
    this.#setTypeClass(value);
  }

  get type(): string | null { return this.getAttribute(attributes.TYPE); }

  /**
   * Sets a CSS Class on the container element for some Text types
   * @param {string} value the class type to check/add
   * @returns {void}
   */
  #setTypeClass(value: string | null): void {
    this.container.classList.remove(...typesCssClasses);
    if (typesCssClasses.includes(value || '')) {
      this.container.classList.add(value);
    }
  }

  /**
   * If set to "unset", color can be controlled by parent container
   * @param {string | null} value  "unset" or undefined/null
   */
  set color(value: string | null) {
    if (value === 'unset') {
      this.setAttribute(attributes.COLOR, value);
      this.container.classList.add('ids-text-color-unset');
      return;
    }
    if (typeof value === 'string') {
      this.setAttribute(attributes.COLOR, value);
      this.container.classList.remove('ids-text-color-unset');
      this.container.style.color = `var(--ids-color-palette-${value})`;
      return;
    }
    this.removeAttribute(attributes.COLOR);
    this.container.classList.remove('ids-text-color-unset');
  }

  get color(): string | null {
    return this.getAttribute(attributes.COLOR);
  }

  /**
   * Set audible as screen reader only text
   * @param {boolean | string} value The audible value
   */
  set audible(value: boolean | string) {
    if (stringToBool(value)) {
      this.setAttribute(attributes.AUDIBLE, value);
      if (!this.container?.classList.contains(attributes.AUDIBLE)) {
        this.container.classList.add('audible');
      }
    } else {
      this.removeAttribute(attributes.AUDIBLE);
      this.container?.classList.remove('audible');
    }
  }

  get audible(): boolean { return stringToBool(this.getAttribute(attributes.AUDIBLE)); }

  /**
   * Set the text to disabled color.
   * @param {boolean} value True if disabled
   */
  set disabled(value: boolean) {
    if (stringToBool(value)) {
      this.setAttribute(attributes.DISABLED, value);
      return;
    }
    this.removeAttribute(attributes.DISABLED);
  }

  get disabled(): boolean { return stringToBool(this.getAttribute(attributes.DISABLED)); }

  /**
   * Set the text to error color.
   * @param {boolean} value True if error text
   */
  set error(value: boolean) {
    const val = stringToBool(value);
    if (val) {
      this.container.classList.add('error');
      this.setAttribute(attributes.ERROR, value);
      return;
    }
    this.removeAttribute(attributes.ERROR);
    this.container.classList.remove('error');
  }

  get error(): boolean { return stringToBool(this.getAttribute(attributes.ERROR)); }

  /**
   * Set the text to label color.
   * @param {boolean} value True if label text
   */
  set label(value: boolean) {
    const val = stringToBool(value);
    if (val) {
      this.container.classList.add('label');
      this.setAttribute(attributes.LABEL, value);
      return;
    }
    this.removeAttribute(attributes.LABEL);
    this.container.classList.remove('label');
  }

  get label(): boolean { return stringToBool(this.getAttribute(attributes.LABEL)); }

  /**
   * Set the text to data color.
   * @param {boolean|string} value True if data text
   */
  set data(value: boolean | string) {
    const val = stringToBool(value);
    if (val) {
      this.container.classList.add('data');
      this.setAttribute(attributes.DATA, value);
      return;
    }
    this.removeAttribute(attributes.DATA);
    this.container.classList.remove('data');
  }

  get data(): boolean { return stringToBool(this.getAttribute(attributes.DATA)); }

  /**
   * Set how content overflows; can specify 'ellipsis', or undefined or 'none'
   * @param {string | null} [value=null] how content is overflow
   */
  set overflow(value: string | null) {
    const isEllipsis = value === 'ellipsis';

    if (isEllipsis) {
      this.container?.classList.add('ellipsis');
      this.setAttribute('overflow', 'ellipsis');
    } else {
      this.container?.classList.remove('ellipsis');
      this.removeAttribute('overflow');
    }
  }

  get overflow(): string | null {
    return this.getAttribute('overflow');
  }

  /**
   * If set to true the value in the text will be considered a key and
   * sent to the translation function
   * @param {boolean} value If true translate this value
   */
  set translateText(value: boolean) {
    const val = stringToBool(value);
    if (val && !this.getAttribute('translation-key')) {
      this.setAttribute(attributes.TRANSLATE_TEXT, value);
      this.setAttribute('translation-key', this.textContent);
      this.#translateAsync();
    }
  }

  get translateText(): boolean {
    return stringToBool(this.getAttribute(attributes.TRANSLATE_TEXT));
  }

  /**
   * Translate the contents asyncronously
   * @private
   */
  async #translateAsync() {
    if (!this.locale) {
      return;
    }

    await this.locale.setLanguage(this.locale.language.name);
    this.textContent = this.locale.translate(this.getAttribute('translation-key'));
  }
}