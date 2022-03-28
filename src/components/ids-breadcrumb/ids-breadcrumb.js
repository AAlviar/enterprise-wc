import { customElement, scss } from '../../core/ids-decorators';
import Base from './ids-breadcrumb-base';
import styles from './ids-breadcrumb.scss';
import { attributes } from '../../core/ids-attributes';
import { stringToBool } from '../../utils/ids-string-utils/ids-string-utils';

import '../ids-menu-button/ids-menu-button';
import '../ids-menu/ids-menu-group';
import '../ids-menu/ids-menu-item';
import '../ids-popup-menu/ids-popup-menu';

/**
 *  IDS Breadcrumb Component
 * @type {IdsBreadcrumb}
 * @inherits IdsElement
 * @mixes IdsEventsMixin
 * @mixes IdsThemeMixin
 * @part breadcrumb
 */
@customElement('ids-breadcrumb')
@scss(styles)
export default class IdsBreadcrumb extends Base {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();

    this.setAttribute('role', 'list');
    this.#attachEventHandlers();

    if (this.truncate) {
      this.#buildOverflowMenu();
    }
    this.setActiveBreadrcrumb();
  }

  /**
   * Return the attributes we handle as getters/setters
   * @returns {Array} The attributes in an array
   */
  static get attributes() {
    return [
      ...super.attributes,
      attributes.PADDING,
      attributes.TRUNCATE
    ];
  }

  /**
   * Attach the resize observer.
   * @private
   * @type {number}
   */
  #resizeObserver = new ResizeObserver(() => this.#resize());

  #attachEventHandlers() {
    this.onEvent('click', this, (e) => {
      if (e.target.tagName === 'IDS-HYPERLINK' && typeof this.onBreadcrumbActivate === 'function') {
        this.onBreadcrumbActivate(e.target, this.current);
      }
    });

    this.onEvent('beforeshow', this.popupMenuEl, (e) => {
      // Reflect this event to the host element
      this.triggerEvent('beforeshow', this, {
        bubbles: e.bubbles,
        detail: e.detail
      });

      this.refreshOverflowedItems();
    });

    this.onEvent('selected', this.popupMenuEl, (e) => {
      // Reflect this event to the host element
      this.triggerEvent('beforeshow', this, {
        bubbles: e.bubbles,
        detail: e.detail
      });

      // Reflect selection of a menu item on the corresponding Breadcrumb item
      if (e.target.overflowTarget && typeof this.onBreadcrumbActivate === 'function') {
        this.onBreadcrumbActivate(e.target.overflowTarget, this.current);
      }
    });
  }

  /**
   * Constructs the overflow
   */
  #buildOverflowMenu() {
    const group = this.popupMenuGroupEl;
    const menuItemHTML = [...this.children].map((elem) => `<ids-menu-item>${elem.textContent}</ids-menu-item>`).join('');
    group.insertAdjacentHTML('afterbegin', menuItemHTML);

    // Connect all "More Action" items generated from Breadcrumb Links to their
    // real counterparts in the list
    this.overflowMenuItems.forEach((item, i) => {
      item.overflowTarget = this.children[i];
    });
  }

  /**
   * Destroys the overflow
   */
  #emptyOverflowMenu() {
    if (this.popupMenuGroupEl) {
      this.popupMenuGroupEl.innerHTML = '';
    }
  }

  /**
   * Resize
   * @private
   * @returns {object} This API object for chaining
   */
  #resize() {
    this.refreshOverflowedItems();

    if (this.hasVisibleActions()) {
      this.#showBreadCrumbMenu();
    } else {
      this.#hideBreadCrumbMenu();
    }

    return this;
  }

  /**
   * Returns the Inner template contents
   * @returns {string} The template
   */
  template() {
    const truncated = this.truncate ? ' truncate' : '';
    return `
      <div class="ids-breadcrumb${truncated}">
        <div class="ids-breadcrumb-menu hidden">
          <ids-menu-button id="icon-button" menu="icon-menu">
            <ids-icon slot="icon" icon="more"></ids-icon>
            <span class="audible">Icon Only Button</span>
          </ids-menu-button>
          <ids-popup-menu id="icon-menu" target="icon-button" trigger="click">
            <ids-menu-group>
            </ids-menu-group>
          </ids-popup-menu>
        </div>
        <nav part="breadcrumb">
          <slot></slot>
        </nav>
      </div>`;
  }

  /**
   * Adds an individual breadcrumb to the end of the bread crumb list
   * @param {Element} breadcrumb The HTML element to add
   */
  add(breadcrumb) {
    breadcrumb.setAttribute('color', 'unset');
    breadcrumb.setAttribute('role', 'listitem');
    breadcrumb.setAttribute('text-decoration', 'hover');
    breadcrumb.setAttribute('hitbox', 'true');
    if (!(breadcrumb.getAttribute('font-size'))) {
      breadcrumb.setAttribute('font-size', 14);
    }

    this.setActiveBreadrcrumb(breadcrumb, this.lastElementChild);
    this.appendChild(breadcrumb);
  }

  /**
   * Removes the last breadcrumb from the bread crumb list
   * @returns {Element | null} The removed element
   */
  delete() {
    if (this.lastElementChild) {
      const breadcrumb = this.removeChild(this.lastElementChild);
      if (this.lastElementChild) {
        this.setActiveBreadrcrumb();
      }
      return breadcrumb;
    }
    return null;
  }

  #showBreadCrumbMenu() {
    this.menuContainerEl.classList.remove(attributes.HIDDEN);
    this.container.classList.add('truncate');
    this.container.querySelector('nav').classList.add('truncate');
  }

  #hideBreadCrumbMenu() {
    this.menuContainerEl.classList.add(attributes.HIDDEN);
    this.container.classList.remove('truncate');
    this.container.querySelector('nav').classList.remove('truncate');
  }

  get current() {
    return this.querySelector('[font-weight="bold"]');
  }

  get buttonEl() {
    return this.container.querySelector('ids-menu-button');
  }

  get menuContainerEl() {
    return this.container.querySelector('.ids-breadcrumb-menu');
  }

  get navElem() {
    return this.container.querySelector('nav');
  }

  /**
   * @readonly
   * @returns {Array<HTMLElement>} list of menu items that mirror Toolbar items
   */
  get overflowMenuItems() {
    if (this.popupMenuEl) {
      return [...this.popupMenuGroupEl.children];
    }
    return [];
  }

  get popupMenuEl() {
    return this.container.querySelector('ids-popup-menu');
  }

  get popupMenuGroupEl() {
    return this.container.querySelector('ids-menu-group');
  }

  /**
   * Set if breadcrumb will be truncated if there isn't enough space
   * @param {boolean|null} value truncate if true
   */
  set truncate(value) {
    const val = stringToBool(value);
    if (val === true) {
      // Set observer for resize
      this.#resizeObserver.disconnect();
      this.#resizeObserver.observe(this.container);
      this.#buildOverflowMenu();
      this.#showBreadCrumbMenu();
      this.setAttribute(attributes.TRUNCATE, value);
    } else {
      this.#resizeObserver.disconnect();
      this.#hideBreadCrumbMenu();
      this.#emptyOverflowMenu();
      this.removeAttribute(attributes.TRUNCATE);
    }
  }

  get truncate() { return this.getAttribute(attributes.TRUNCATE); }

  /**
   * If set to number the breadcrumb container will have padding added (in pixels)
   * @param {string} value sets the padding to the container
   */
  set padding(value) {
    this.container.style.padding = `0 ${value}px`;
    this.setAttribute(attributes.PADDING, value.toString());
  }

  get padding() {
    return this.getAttribute(attributes.PADDING);
  }

  /**
   * @param {HTMLElement} item reference to the toolbar item to be checked for overflow
   * @returns {boolean} true if the item is a toolbar member and should be displayed by overflow
   */
  isOverflowed(item) {
    if (!this.contains(item)) {
      return false;
    }
    if (item.hidden) {
      return false;
    }

    const itemRect = item.getBoundingClientRect();
    const sectionRect = this.navElem.getBoundingClientRect();

    const isBeyondRightEdge = itemRect.right > sectionRect.right;
    const isBeyondLeftEdge = itemRect.left < sectionRect.left;

    return isBeyondLeftEdge || isBeyondRightEdge;
  }

  /**
   * Refreshes the visible state of menu items representing "overflowed" elements
   * @returns {void}
   */
  refreshOverflowedItems() {
    this.overflowMenuItems.forEach((item) => {
      const doHide = !this.isOverflowed(item.overflowTarget);
      item.hidden = doHide;
      if (doHide) {
        item.overflowTarget?.removeAttribute(attributes.OVERFLOWED);
      } else {
        item.overflowTarget?.setAttribute(attributes.OVERFLOWED, '');
      }
    });

    this.menuContainerEl.hidden = !this.hasVisibleActions();
    this.buttonEl.hidden = !this.hasVisibleActions();
    this.buttonEl.disabled = !this.hasEnabledActions();
  }

  /**
   * @returns {boolean} true if there are currently visible actions in this menu
   */
  hasVisibleActions() {
    return this.container.querySelectorAll('ids-menu-group > ids-menu-item:not([hidden])').length > 0;
  }

  /**
   * @returns {boolean} true if there are currently enabled (read: not disabled) actions in this menu
   */
  hasEnabledActions() {
    return this.container.querySelectorAll('ids-menu-group > ids-menu-item:not([disabled])').length > 0;
  }

  /**
   * @param {HTMLElement} el the target breadcrumb link
   * @param {HTMLElement} [previousActiveBreadcrumbEl] a previously-activated Breadcrumb, if applicable
   */
  setActiveBreadrcrumb(el, previousActiveBreadcrumbEl) {
    let targetEl = el;
    if (!this.contains(targetEl)) {
      targetEl = this.lastElementChild;
    }
    if (previousActiveBreadcrumbEl) {
      previousActiveBreadcrumbEl.removeAttribute(attributes.FONT_WEIGHT);
    }
    targetEl.setAttribute(attributes.FONT_WEIGHT, 'bold');
  }
}
