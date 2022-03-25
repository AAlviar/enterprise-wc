import { customElement, scss } from '../../core/ids-decorators';
import { attributes } from '../../core/ids-attributes';
import { stringToBool } from '../../utils/ids-string-utils/ids-string-utils';

import Base from './ids-button-base';
import {
  BUTTON_TYPES, BUTTON_DEFAULTS, BUTTON_ATTRIBUTES, ICON_ALIGN, baseProtoClasses
} from './ids-button-attributes';

import styles from './ids-button.scss';

/**
 * IDS Button Component
 * @type {IdsButton}
 * @inherits IdsElement
 * @mixes IdsEventsMixin
 * @mixes IdsColorVariantMixin
 * @mixes IdsLocaleMixin
 * @mixes IdsThemeMixin
 * @mixes IdsTooltipMixin
 * @part button - the button element
 * @part icon - the icon element
 * @part text - the text element
 */
@customElement('ids-button')
@scss(styles)
export default class IdsButton extends Base {
  constructor() {
    super();
    this.state = {};
    Object.keys(BUTTON_DEFAULTS).forEach((prop) => {
      this.state[prop] = BUTTON_DEFAULTS[prop];
    });
    this.shouldUpdate = true;
  }

  /**
   * Override `attributeChangedCallback` from IdsElement to wrap its normal operation in a
   * check for a true `shouldUpdate` property.
   * @param  {string} name The property name
   * @param  {string} oldValue The property old value
   * @param  {string} newValue The property new value
   */
  attributeChangedCallback(name: any, oldValue: any, newValue: string) {
    if (this.shouldUpdate) {
      switch (name) {
      // Convert "tabindex" to "tabIndex"
        case 'tabindex':
          if (Number.isNaN(Number.parseInt(newValue))) {
            this.tabIndex = null;
          }
          this.tabIndex = Number(newValue);
          break;
        case 'width':
          if (oldValue !== newValue) {
            this.width = newValue;
          }
          break;
        default:
          super.attributeChangedCallback.apply(this, [name, oldValue, newValue]);
          break;
      }
    }
  }

  /**
   * Button-level `connectedCallback` implementation
   * @returns {void}
   */
  connectedCallback() {
    const isIconButton = this.button.classList.contains('ids-icon-button');
    this.setupRipple(this.button, isIconButton ? 35 : 50);
    this.setIconAlignment();
    this.shouldUpdate = true;
    super.connectedCallback();
  }

  /**
   * Return the attributes we handle as getters/setters
   * @returns {Array} The attributes in an array
   */
  static get attributes() {
    return [...super.attributes, ...BUTTON_ATTRIBUTES];
  }

  /**
   * Inherited from `IdsColorVariantMixin`
   * @returns {Array<string>} List of available color variants for this component
   */
  colorVariants = ['alternate', 'alternate-formatter'];

  /**
   * Figure out the classes
   * @private
   * @readonly
   * @returns {Array} containing classes used to identify this button prototype
   */
  get protoClasses() {
    const textSlot = this.querySelector('span:not(.audible), ids-text:not([audible])');
    const iconSlot = this.querySelector('ids-icon[slot]') || this.querySelector('ids-icon');
    if (iconSlot && (!textSlot)) {
      return ['ids-icon-button'];
    }
    return ['ids-button'];
  }

  /**
   * Refreshes this button's prototype CSS class
   * @private
   * @returns {void}
   */
  refreshProtoClasses() {
    const cl = this.button.classList;
    const newProtoClass = this.protoClasses;

    cl.remove(...baseProtoClasses);
    cl.add(...newProtoClass);
  }

  /**
   * Inner template contents
   * @returns {string} The template
   */
  template() {
    let cssClass = '';
    let protoClasses = '';
    let disabled = '';
    let icon = '';
    let tabIndex = 'tabindex="0"';
    let text = '';
    let type = '';
    if (this.state?.cssClass) {
      cssClass = ` ${this.state.cssClass.join(' ')}`;
    }
    if (this.state?.disabled) {
      disabled = ` disabled="true"`;
    }
    if (this.state?.tabIndex) {
      tabIndex = `tabindex="${this.state.tabIndex}"`;
    }
    if (this.state?.icon) {
      icon = `<ids-icon slot="icon" part="icon" icon="${this.state.icon}"></ids-icon>`;
    }
    if (this.state?.text) {
      text = `<span slot="text" part="text">${this.state.text}</span>`;
    }
    if (this.state && this.state?.type !== 'default') {
      type = ` btn-${this.state.type}`;
    }

    if (this.hasAttribute(attributes.SQUARE)) {
      cssClass += ' square';
    }

    if (this.protoClasses.length) {
      protoClasses = `${this.protoClasses.join(' ')}`;
    }

    let alignCSS = ' align-icon-start';
    let namedSlots = `<slot name="icon" part="icon">${icon}</slot><slot name="text">${text}</slot>`;
    if (this.state?.iconAlign === 'end') {
      alignCSS = ' align-icon-end';
      namedSlots = `<slot name="text" part="text">${text}</slot><slot name="icon">${icon}</slot>`;
    }

    return `<button part="button" class="${protoClasses}${type}${alignCSS}${cssClass}" ${tabIndex}${disabled}>
      ${namedSlots}
      <slot>${icon}${text}</slot>
    </button>`;
  }

  /**
   * @readonly
   * @returns {HTMLButtonElement} reference to the true button element used in the Shadow Root
   */
  get button() {
    return this.shadowRoot.querySelector('button');
  }

  /**
   * @param {Array|string} val containing CSS classes that will be applied to the button
   * Strings will be split into an array and separated by whitespace.
   */
  set cssClass(val) {
    let attr = val;
    let newCl: any[] = [];
    // @TODO replace with clone utils method
    const prevClasses = [].concat(this.state.cssClass);

    if (Array.isArray(val)) {
      newCl = val;
      attr = val.join(' ');
    } else if (typeof val === 'string' && val.length) {
      newCl = val.split(' ');
    }

    this.state.cssClass = newCl;
    if (newCl.length) {
      this.setAttribute(attributes.CSS_CLASS, attr.toString());
    } else {
      this.removeAttribute(attributes.CSS_CLASS);
    }

    // Remove/Set CSS classes on the actual inner Button component
    const buttonCl = this.button.classList;
    const buttonClArr = Array.from(buttonCl);
    prevClasses.forEach((cssClass) => {
      if (!newCl.includes(cssClass)) {
        buttonCl.remove(cssClass);
      }
    });
    newCl.forEach((newCssClass) => {
      if (!buttonClArr.includes(newCssClass)) {
        buttonCl.add(newCssClass);
      }
    });
  }

  get cssClass() {
    return this.state.cssClass;
  }

  /**
   * Passes a disabled attribute from the custom element to the button
   * @param {boolean|string} val true if the button will be disabled
   */
  set disabled(val) {
    const isValueTruthy = stringToBool(val);
    this.shouldUpdate = false;
    if (isValueTruthy) {
      this.setAttribute(attributes.DISABLED, '');
    } else {
      this.removeAttribute(attributes.DISABLED);
    }

    this.shouldUpdate = true;
    this.state.disabled = isValueTruthy;

    if (this.button) {
      this.button.disabled = isValueTruthy;
    }
  }

  get disabled() {
    return this.state.disabled;
  }

  /**
   * @param {boolean} val true if the button component should be hidden from view
   */
  set hidden(val) {
    const isValueTruthy = stringToBool(val);
    this.shouldUpdate = false;
    if (isValueTruthy) {
      this.setAttribute(attributes.HIDDEN, '');
    } else {
      this.removeAttribute(attributes.HIDDEN);
    }

    this.shouldUpdate = true;
    this.state.hidden = isValueTruthy;

    if (this.button) {
      this.button.hidden = isValueTruthy;
    }
  }

  /**
   * @returns {boolean} true if the button component is hidden from view
   */
  get hidden() {
    return this.state.hidden;
  }

  /**
   * Passes a tabIndex attribute from the custom element to the button
   * @param {number} val the tabIndex value
   * @returns {void}
   */
  set tabIndex(val) {
    const trueVal = Number(val);

    if (Number.isNaN(trueVal) || trueVal < -1) {
      this.state.tabIndex = 0;
      this.button.setAttribute(attributes.TABINDEX, '0');
      this.removeAttribute(attributes.TABINDEX);
      return;
    }

    this.state.tabIndex = trueVal;
    this.button.setAttribute(attributes.TABINDEX, `${trueVal}`);
  }

  /**
   * @returns {number} the current tabIndex number for the button
   */
  get tabIndex() {
    return this.state.tabIndex;
  }

  /**
   * Sets the icon on the button
   * @param {undefined|string} val representing the icon to set
   */
  set icon(val) {
    if (typeof val !== 'string' || !val.length) {
      this.removeAttribute(attributes.ICON);
      this.state.icon = undefined;
      this.removeIcon();
      return;
    }
    this.state.icon = val;
    this.setAttribute(attributes.ICON, val);
    this.appendIcon(val);
  }

  /**
   * Gets the current icon used on the button
   * @returns {undefined|string} a defined IdsIcon's `icon` attribute, if one is present
   */
  get icon() {
    return this.querySelector('ids-icon')?.getAttribute('icon');
  }

  /**
   * Gets the current icon element
   * @returns {HTMLElement|null} a defined IdsIcon, if one is present
   */
  get iconEl() {
    return this.querySelector('ids-icon');
  }

  /**
   * Sets the alignment of an existing icon to the 'start' or 'end' of the text
   * @param {string} val the alignment type to set.
   */
  set iconAlign(val) {
    let trueVal = val;
    if (!ICON_ALIGN.includes(`align-icon-${val}`)) {
      trueVal = 'start';
    }
    this.state.iconAlign = trueVal;
    this.setIconAlignment();
  }

  /**
   * @returns {string} containing 'start' or 'end'
   */
  get iconAlign() {
    return this.state.iconAlign;
  }

  /**
   * Get width
   * @returns {string|null} 100%, 90px, 50rem etc.
   */
  get width() {
    return this.getAttribute('width');
  }

  /**
   * Set width of button
   * @param {string} w 100%, 90px, 50rem etc.
   */
  set width(w) {
    if (!w) {
      this.removeAttribute('width');
      this.style.width = '';
      this.button.style.width = '';
      return;
    }

    // if percentage passed set width to host
    if (w.indexOf('%') !== -1) {
      this.style.width = w;
      this.button.style.width = '';
    } else {
      this.style.width = '';
      this.button.style.width = w;
    }

    this.setAttribute('width', w);
  }

  /**
   * Check if an icon exists, and adds the icon if it's missing
   * @param {string} iconName The icon name to check
   * @private
   */
  appendIcon(iconName: string) {
    // First look specifically for an icon slot.
    const icon = this.querySelector(`ids-icon`); // @TODO check for dropdown/expander icons here

    if (icon) {
      icon.icon = iconName;
      this.setIconAlignment();
    } else {
      this.insertAdjacentHTML('afterbegin', `<ids-icon slot="icon" icon="${iconName}" class="ids-icon"></ids-icon>`);
    }

    this.refreshProtoClasses();
  }

  /**
   * Check if an icon exists, and removes the icon if it's present
   * @private
   */
  removeIcon() {
    const icon = this.querySelector(`ids-icon`); // @TODO check for dropdown/expander icons here

    if (icon) {
      icon.remove();
    }
    this.setIconAlignment();
    this.refreshProtoClasses();
  }

  /**
   * Adds/Removes Icon Alignment CSS classes to/from the inner button component.
   * @private
   */
  setIconAlignment() {
    const alignment = this.iconAlign || 'start';
    const iconStr = this.icon;
    this.button.classList.remove(...ICON_ALIGN);

    // Append the icon, if needed
    if (iconStr) {
      this.button.classList.add(`align-icon-${alignment}`);
    }

    // Re-arrange the slots
    const iconSlot = this.button.querySelector('slot[name="icon"]');
    if (!iconSlot) {
      return;
    }

    if (alignment === 'end') {
      this.button.appendChild(iconSlot);
    } else {
      this.button.prepend(iconSlot);
    }
  }

  /**
   * @param {string} val the text value
   * @returns {void}
   */
  set text(val) {
    this.removeAttribute(attributes.TEXT);

    if (typeof val !== 'string' || !val.length) {
      this.state.text = '';
      this.removeText();
      return;
    }

    // @TODO: Run this through an XSS check
    this.state.text = val;
    this.appendText(val);
  }

  /**
   * @returns {string} the current text value
   */
  get text() {
    const textElem = this.querySelector('span:not(.audible)');
    if (textElem && textElem.textContent?.length) {
      return textElem.textContent;
    }
    return this.textContent;
  }

  /**
   * Check if the text slot exists, and appends it if it's missing
   * @param {string} val New text contents
   * @private
   */
  appendText(val: string) {
    const text = this.querySelector(`span:not(.audible)`);
    if (text) {
      text.textContent = val;
    } else {
      this.insertAdjacentHTML('afterbegin', `<span>${val}</span>`);
    }
    this.refreshProtoClasses();
  }

  /**
   * Checks if the text slot exists, and removes it if necessary
   * @private
   */
  removeText() {
    const text = this.querySelector(`span:not(.audible)`);
    if (text) {
      text.remove();
    }
    this.refreshProtoClasses();
  }

  /**
   * Set the button types between 'default', 'primary', 'secondary', 'tertiary', or 'destructive'
   * @param {string} val a valid button "type"
   */
  set type(val) {
    if (!val || BUTTON_TYPES.indexOf(val) <= 0) {
      this.removeAttribute(attributes.TYPE);
      this.state.type = BUTTON_TYPES[0];
    } else {
      this.setAttribute(attributes.TYPE, val);
      if (this.state.type !== val) {
        this.state.type = val;
      }
    }
    this.setTypeClass(val);
  }

  /**
   * @returns {string} the currently set type
   */
  get type() {
    return this.state.type;
  }

  /**
   * Sets the no margins attribute
   * @param {boolean | string} n string value from the no margins attribute
   */
  set noMargins(n: boolean | string) {
    if (stringToBool(n)) {
      this.setAttribute(attributes.NO_MARGINS, '');
      this.container.classList.add(attributes.NO_MARGINS);
      return;
    }
    this.removeAttribute(attributes.NO_MARGINS);
    this.container.classList.remove(attributes.NO_MARGINS);
  }

  get noMargins() {
    return stringToBool(this.getAttribute(attributes.NO_MARGINS));
  }

  /**
   * @param {boolean | string} val true if the button should not have standard padding rules applied
   */
  set noPadding(val: boolean | string) {
    const isTruthy = this.noPadding;
    const trueVal = stringToBool(val);
    if (isTruthy !== trueVal) {
      if (trueVal) {
        this.container.classList.add('no-padding');
        this.setAttribute('no-padding', 'true');
      } else {
        this.container.classList.remove('no-padding');
        this.removeAttribute('no-padding');
      }
    }
  }

  /**
   * @returns {boolean | string} true if the button does not currently have standard padding rules applied
   */
  get noPadding(): boolean | string {
    return this.container.classList.contains('no-padding');
  }

  /**
   * @param {boolean} value whether the corners of the button as an icon-button should be angled/90°
   */
  set square(value: boolean) {
    const isTruthy = stringToBool(value);

    if (isTruthy && !this.button.classList.contains('square')) {
      this.button.classList.add('square');
    } else if (!isTruthy && this.button.classList.contains('square')) {
      this.button.classList.remove('square');
    }

    if (isTruthy && !this.hasAttribute(attributes.SQUARE)) {
      this.setAttribute(attributes.SQUARE, '');
    } else if (!isTruthy && this.hasAttribute(attributes.SQUARE)) {
      this.removeAttribute(attributes.SQUARE);
    }
  }

  /**
   * @returns {boolean} whether the corners of the button as an icon-button are angled/90°
   */
  get square(): boolean {
    return this.hasAttribute(attributes.SQUARE);
  }

  /**
   * Sets the correct type class on the Shadow button.
   * @private
   * @param {string} val desired type class
   */
  setTypeClass(val: string) {
    BUTTON_TYPES.forEach((type) => {
      const typeClassName = `btn-${type}`;
      if (val === type) {
        if (type !== 'default' && !this.button.classList.contains(typeClassName)) {
          this.button.classList.add(typeClassName);
        }
        return;
      }
      if (this.button.classList.contains(typeClassName)) {
        this.button.classList.remove(typeClassName);
      }
    });
  }

  /**
   * Overrides the standard "focus" behavior to instead pass focus to the inner HTMLButton element.
   */
  focus() {
    this.button.focus();
  }

  /**
   * Implements callback from IdsColorVariantMixin used to
   * update the color variant on children components
   * @returns {void}
   */
  onColorVariantRefresh() {
    const icons = this.querySelectorAll('ids-icon');
    const texts = this.querySelectorAll('ids-text');
    const iterator = (el: { colorVariant: any; }) => {
      el.colorVariant = this.colorVariant;
    };
    [...icons, ...texts].forEach(iterator);
  }
}
