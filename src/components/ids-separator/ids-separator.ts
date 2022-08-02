import { customElement, scss } from '../../core/ids-decorators';
import { attributes } from '../../core/ids-attributes';
import { stringToBool } from '../../utils/ids-string-utils/ids-string-utils';

import Base from './ids-separator-base';
import styles from './ids-separator.scss';

/**
 * IDS Separator Component
 * @type {IdsSeparator}
 * @inherits IdsElement
 * @mixes IdsColorVariantMixin
 * @mixes IdsEventsMixin
 * @mixes IdsThemeMixin
 * @part separator - the menu separator element
 */
@customElement('ids-separator')
@scss(styles)
export default class IdsSeparator extends Base {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
  }

  static get attributes(): Array<string> {
    return [
      ...super.attributes,
      attributes.VERTICAL
    ];
  }

  /**
   * Inherited from `IdsColorVariantMixin`
   * @returns {Array<string>} List of available color variants for this component
   */
  colorVariants: Array<string> = ['alternate-formatter'];

  /**
   * @returns {string} The components template
   */
  template(): string {
    let tagName = 'div';
    if (this.parentElement?.tagName === 'IDS-MENU-GROUP') {
      tagName = 'li';
    }
    return `<${tagName} part="separator" class="ids-separator"></${tagName}>`;
  }

  /**
   * Set the separator to be vertical
   */
  set vertical(val: boolean) {
    const current = this.vertical;
    const trueVal = stringToBool(val);
    if (current !== trueVal) {
      if (trueVal) {
        this.container.classList.add('vertical');
        this.setAttribute('vertical', '');
      } else {
        this.container.classList.remove('vertical');
        this.removeAttribute('vertical');
      }
    }
  }

  get vertical() {
    return this.container?.classList.contains('vertical');
  }
}
