import { customElement, scss } from '../../core/ids-decorators';

import Base from './ids-app-base';
import '../ids-drawer/ids-drawer';
import '../ids-accordion/ids-accordion';
import '../ids-button/ids-button';
import '../ids-icon/ids-icon';
import '../ids-text/ids-text';
import '../ids-toolbar/ids-toolbar';

import styles from './ids-app-menu.scss';

/**
 * IDS App Menu Component
 * @type {IdsAppMenu}
 * @inherits IdsDrawer
 * @part avatar - the user avatar
 * @part accordion - the accordion root element
 */
@customElement('ids-app-menu')
@scss(styles)
export default class IdsAppMenu extends Base {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.edge = 'start';
    this.type = 'app-menu';
    this.#connectSearchField();
    this.#refreshVariants();
  }

  static get attributes() {
    return [...super.attributes];
  }

  // Slots:
  // - Avatar
  // - Roles (Accordion)
  // - Header Nav (Toolbar)
  // - Searchfield
  // - Content (Accordion)
  // - Footer Nav (Toolbar)
  template() {
    return `<div class="ids-drawer ids-app-menu type-app-menu">
      <div class="ids-app-menu-user">
        <slot name="avatar"></slot>
        <slot name="username"></slot>
      </div>
      <div class="ids-app-menu-header">
        <slot name="header"></slot>
      </div>
      <div class="ids-app-menu-search">
        <slot name="search"></slot>
      </div>
      <div class="ids-app-menu-content">
        <slot></slot>
      </div>
      <div class="ids-app-menu-footer">
        <slot name="footer"></slot>
      </div>
      <div class="ids-app-menu-branding">
        <ids-icon icon="logo" viewbox="0 0 35 34" size="large"></ids-icon>
      </div>
    </div>`;
  }

  /**
   * @readonly
   * @returns {HTMLElement} reference to an optionally-slotted IdsAccordion element
   */
  get accordion(): HTMLElement {
    return this.querySelector(`ids-accordion:not([slot])`);
  }

  /**
   * @readonly
   * @property {boolean} isFiltered true if the inner navigation accordion is currently being filtered
   */
  isFiltered = false;

  #refreshVariants() {
    const accordions = [...this.querySelectorAll('ids-accordion')];
    accordions.forEach((acc) => {
      acc.colorVariant = 'app-menu';
    });

    const btns = [...this.querySelectorAll('ids-button')];
    btns.forEach((btn) => {
      btn.colorVariant = 'alternate';
    });
  }

  /**
   * Attaches a slotted IdsSearchField component to the app menu
   */
  #connectSearchField() {
    const searchfield = this.querySelector('ids-search-field[slot="search"]');
    if (searchfield) {
      searchfield.onSearch = (value: string) => {
        if (value !== '') {
          return this.filterAccordion(value);
        }

        this.clearFilterAccordion();
        return [];
      };
      this.offEvent('cleared.search');
      this.onEvent('cleared.search', searchfield, () => this.clearFilterAccordion());
    }
  }

  /**
   * Performs a filter operation on accordion panels
   * @param {string} value text value with which to filter accordion panels
   * @returns {Array<HTMLElement>} containing matching accordion panels
   */
  filterAccordion = (value = '') => {
    // Do nothing if there is no accordion, or there are no accordion panels
    if (!this.accordion) {
      return [];
    }
    const panels = [...this.accordion.querySelectorAll('ids-accordion-panel')];
    if (!panels.length) {
      return [];
    }

    // Always remove previous highlight before applying a new one
    this.clearFilterAccordion();

    // Check each accordion panel for a match.
    // Accordion panels are shown/hidden as needed
    const valueRegex = new RegExp(value, 'gi');
    const markParentPanel = (thisPanel: any) => {
      if (thisPanel.hasParentPanel) {
        const parentPanel = thisPanel.parentElement;
        const parentHeader = parentPanel.header;

        if (!parentPanel.expanded) {
          parentPanel.expanded = true;
        }

        parentHeader.childFilterMatch = true;
        markParentPanel(parentPanel);
      }
    };

    return panels.filter((panel: any) => {
      const header = panel.header;
      const textContent = header.textContent.trim();
      const hasTextMatch = textContent.match(valueRegex);
      if (hasTextMatch) {
        // Highlight
        // NOTE: Apply text highlighter here (See #494)
        if (header.hiddenByFilter) {
          header.hiddenByFilter = false;
        }
        markParentPanel(panel);
        this.isFiltered = true;
        return header;
      }

      // Unhighlight
      if (!header.hiddenByFilter) {
        header.hiddenByFilter = true;
      }
    });
  };

  /**
   * Clears a navigation accordion's previous filter result
   * @private
   */
  clearFilterAccordion() {
    const filteredHeaders: any = [...this.accordion.querySelectorAll('ids-accordion-header[hidden-by-filter]')];
    filteredHeaders.map((header: any) => {
      header.hiddenByFilter = false;
      return header;
    });

    // NOTE: Clear text highlighter here (See #494)
    this.#clearChildFilter();
    this.isFiltered = false;
  }

  /**
   * Resets the "child-filter-match" attribute on any accordion headers who's children matched a previous filter result
   * @returns {void}
   */
  #clearChildFilter() {
    const childFilterMatches: any = [...this.accordion.querySelectorAll('[child-filter-match]')];
    childFilterMatches.map((header: any) => {
      header.childFilterMatch = false;
      return header;
    });
  }

  /**
   * Overrides `addOpenEvents` from IdsPopupOpenEventsMixin to add a global handler
   * for App Menu keyboard events that can cause the menu to close
   */
  addOpenEvents() {
    super.addOpenEvents();

    this.globalKeydownListener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        this.hide();
      }
    };
    document.addEventListener('keydown', this.globalKeydownListener);
  }

  /**
   * Overrides `removeOpenEvents` from IdsPopupOpenEventsMixin
   */
  removeOpenEvents() {
    super.removeOpenEvents();
    document.removeEventListener('keydown', this.globalKeydownListener);
  }
}
