import IdsElement from '../../core/ids-element';
import { attributes } from '../../core/ids-attributes';
import { customElement, scss } from '../../core/ids-decorators';
import { setBooleanAttr } from '../../utils/ids-attribute-utils/ids-attribute-utils';
import { Breakpoints, isWidthBelow } from '../../utils/ids-breakpoint-utils/ids-breakpoint-utils';
import { getClosest } from '../../utils/ids-dom-utils/ids-dom-utils';

import { RESPONSIVE_BREAKPOINT } from './ids-module-nav-common';

import IdsBreakpointMixin from '../../mixins/ids-breakpoint-mixin/ids-breakpoint-mixin';
import IdsModuleNavDisplayModeMixin from './ids-module-nav-display-mode-mixin';

import styles from './ids-module-nav.scss';

import type IdsContainer from '../ids-container/ids-container';
import type IdsModuleNavBar from './ids-module-nav-bar';
import type IdsModuleNavContent from './ids-module-nav-content';

const Base = IdsModuleNavDisplayModeMixin(
  IdsBreakpointMixin(
    IdsElement
  )
);

/**
 * IDS Module Nav Bar Component
 * @type {IdsModuleNavBar}
 * @inherits IdsDrawer
 */
@customElement('ids-module-nav')
@scss(styles)
export default class IdsModuleNav extends Base {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.configureResponsiveBehavior();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback?.();
  }

  /**
   * Return the attributes we handle as getters/setters
   * @returns {Array} The attributes as an array
   */
  static get attributes() {
    return [
      ...super.attributes,
      attributes.RESPONSIVE,
    ];
  }

  template() {
    return `<div class="ids-module-nav">
      <slot></slot>
    </div>`;
  }

  /**
   * @readonly
   * @returns {IdsModuleNavBar | undefined} reference to the Module Nav bar
   */
  get bar() {
    const barEl = this.querySelector('ids-module-nav-bar');
    if (barEl?.tagName === 'IDS-MODULE-NAV-BAR') {
      return (barEl as IdsModuleNavBar);
    }
    return undefined;
  }

  /**
   * @readonly
   * @returns {IdsModuleNavContent | undefined} reference to the content pane
   */
  get content() {
    const contentEl = this.querySelector('ids-module-nav-content');
    if (contentEl?.tagName === 'IDS-MODULE-NAV-CONTENT') {
      return (contentEl as IdsModuleNavContent);
    }
    return undefined;
  }

  /**
   * @readonly
   * @returns {IdsContainer | undefined} reference to the Module Nav parent element
   */
  get parent() {
    const parentEl: IdsContainer | undefined = getClosest(this, 'ids-container');
    if (parentEl) return parentEl;
    return undefined;
  }

  /**
   * @param {boolean | string} val if truthy, causes the Module Nav system to respond to a mobile breakpoint
   */
  set responsive(val: boolean | string) {
    setBooleanAttr(attributes.RESPONSIVE, this, val);
    this.configureResponsiveBehavior();
  }

  get responsive() {
    return this.hasAttribute(attributes.RESPONSIVE);
  }

  /**
   * Inherited from IdsModuleNavDisplayModeMixin
   */
  onDisplayModeChange(): void {
    if (this.bar) this.bar.displayMode = this.displayMode;
    if (this.content) this.content.displayMode = this.displayMode;

    if (this.displayMode !== 'expanded') {
      this.hideContentOverlay();
    } else if (this.isWithinMobileBreakpoint()) {
      this.content?.showOverlay();
    }
  }

  /**
   * Responds to outside clicks established by the Module Nav bar
   * using the IDS Breakpoint system established in this component.
   */
  handleOutsideClick() {
    // Don't close the popup if md+ media query breakpoint
    if (this.displayMode === 'expanded' && this.isWithinMobileBreakpoint()) {
      this.displayMode = false;
    }
  }

  /**
   * Sets up required parts for IdsBreakpointMixin-driven mobile behavior
   */
  private configureResponsiveBehavior() {
    if (this.responsive) {
      this.onBreakpointDownResponse = (detectedBreakpoint: keyof Breakpoints, matches: boolean) => {
        if (matches) {
          this.handleBelowBreakpoint();
        } else {
          this.handleAboveBreakpoint();
        }
      };
      this.respondDown = RESPONSIVE_BREAKPOINT;
    } else {
      this.onBreakpointDownResponse = () => {};
      this.respondDown = null;
    }
  }

  /**
   * Switches the Module Nav into its mobile behavior mode
   */
  private handleAboveBreakpoint() {
    console.info('Mobile module nav deactivated');
    this.hideContentOverlay();
    if (this.displayMode !== 'expanded') {
      this.displayMode = 'collapsed';
    }
  }

  /**
   * Switches the Module Nav into its desktop behavior mode
   */
  private handleBelowBreakpoint() {
    console.info('Mobile module nav activated');
    if (this.displayMode === 'expanded') {
      this.content?.showOverlay();
    } else {
      this.displayMode = false;
    }
  }

  private hideContentOverlay() {
    if (this.content && this.content.overlay!.visible) {
      this.content.hideOverlay();
    }
  }

  /**
   * @returns {boolean} true if the mobile breakpoint conditions are currently being met
   */
  isWithinMobileBreakpoint() {
    const mq = isWidthBelow(RESPONSIVE_BREAKPOINT);
    return mq.matches;
  }
}
