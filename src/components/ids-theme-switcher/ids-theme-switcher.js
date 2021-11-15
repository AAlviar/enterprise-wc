import { customElement, scss } from '../../core/ids-decorators';
import { attributes } from '../../core/ids-attributes';
import IdsMenuButton from '../ids-menu-button/ids-menu-button';
import Base from './ids-theme-switcher-base';
import styles from './ids-theme-switcher.scss';

/**
 * IDS Theme Switcher Component
 */
@customElement('ids-theme-switcher')
@scss(styles)
export default class IdsThemeSwitcher extends Base {
  constructor() {
    super();
  }

  connectedCallback() {
    this.#attachEventHandlers();
  }

  /**
   * Establish Internal Event Handlers
   * @private
   */
  #attachEventHandlers() {
    // Handle Clicking the x for dismissible
    // Ensure icon is always last
    this.onEvent('selected', this.shadowRoot.querySelector('ids-popup-menu'), (e) => {
      const val = e.detail.elem.value;
      if (val === 'classic' || val === 'new') {
        this.version = val;
      }
      if (val === 'light' || val === 'dark' || val === 'contrast') {
        this.mode = val;
      }
    });
  }

  /**
   * Create the Template for the contents
   * @returns {string} The template
   */
  template() {
    return `<ids-menu-button id="ids-theme-switcher" menu="ids-theme-menu">
            <ids-icon slot="icon" icon="more"></ids-icon>
            <span class="audible">Theme Switcher</span>
        </ids-menu-button>
        <ids-popup-menu id="ids-theme-menu" target="#ids-theme-switcher" trigger="click">
          <ids-menu-group>
            <ids-menu-item>
              Theme
              <ids-popup-menu>
                <ids-menu-group select="single">
                  <ids-menu-item selected="true" value="new">New</ids-menu-item>
                  <ids-menu-item value="classic">Classic</ids-menu-item>
                </ids-menu-group>
              </ids-popup-menu>
            </ids-menu-item>
            <ids-menu-item>
              Mode
              <ids-popup-menu>
                <ids-menu-group select="single">
                  <ids-menu-item selected="true" value="light">Light</ids-menu-item>
                  <ids-menu-item value="dark">Dark</ids-menu-item>
                  <ids-menu-item value="contrast">High Contrast</ids-menu-item>
                </ids-menu-group>
              </ids-popup-menu>
            </ids-menu-item>
          </ids-menu-group>
        </ids-popup-menu>`;
  }

  /**
   * Return the attributes we handle as getters/setters
   * @returns {Array} The attributes in an array
   */
  static get attributes() {
    return [...super.attributes, attributes.LANGUAGE, attributes.MODE, attributes.VERSION];
  }

  /**
   * Inherited from `IdsColorVariantMixin`
   * @returns {Array<string>} List of available color variants for this component
   */
  colorVariants = ['alternate'];

  /**
   * Set the mode of the current theme
   * @param {string} value The mode value for example: light, dark, or high-contrast
   */
  set mode(value) {
    if (value) {
      this.setAttribute('mode', value);
      this.triggerEvent('themechanged', this, { detail: { elem: this, mode: value, version: this.version } });
      return;
    }

    this.removeAttribute('mode');
  }

  get mode() { return this.getAttribute('mode') || 'light'; }

  /**
   * Set the theme to a particular theme version
   * @param {string} value The version value for example: classic or new
   */
  set version(value) {
    if (value) {
      this.setAttribute('version', value);
      this.triggerEvent('themechanged', this, { detail: { elem: this, mode: this.mode, version: value } });
      return;
    }

    this.removeAttribute('version');
  }

  get version() { return this.getAttribute('version') || 'new'; }

  /**
   * Implements callback from IdsColorVariantMixin used to
   * update the color variant setting on children components
   * @returns {void}
   */
  onColorVariantRefresh() {
    // Updates the inner menu button's color variant, which should match the theme switcher's
    this.container.colorVariant = this.colorVariant;
  }
}
