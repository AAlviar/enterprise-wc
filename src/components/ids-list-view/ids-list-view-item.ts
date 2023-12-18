import { customElement, scss } from '../../core/ids-decorators';
import { attributes } from '../../core/ids-attributes';
import { stringToBool } from '../../utils/ids-string-utils/ids-string-utils';
import IdsEventsMixin from '../../mixins/ids-events-mixin/ids-events-mixin';
import IdsElement from '../../core/ids-element';
import '../ids-checkbox/ids-checkbox';
import '../ids-swappable/ids-swappable';
import '../ids-swappable/ids-swappable-item';
import styles from './ids-list-view-item.scss';
import type IdsListView from './ids-list-view';
import type IdsCheckbox from '../ids-checkbox/ids-checkbox';
import type IdsSwappableItem from '../ids-swappable/ids-swappable-item';

const Base = IdsEventsMixin(
  IdsElement
);

/**
 * IDS List View Item Component
 * @type {IdsListViewItem}
 * @inherits IdsElement
 */
@customElement('ids-list-view-item')
@scss(styles)
export default class IdsListViewItem extends Base {
  protected rootNode?: IdsListView;

  /**
   * Reference to the ids-list-view parent element
   * @returns {IdsListView} the ids-list-view parent
   */
  get listView(): IdsListView {
    if (!this.rootNode) this.rootNode = (this.getRootNode() as any)?.host ?? this.closest('ids-list-view, ids-list-builder');
    return this.rootNode as IdsListView;
  }

  get nextEnabled() {
    let currentIndex = this.rowIndex;
    while (this.listView?.itemByIndex(++currentIndex)?.hasAttribute('disabled')) continue;
    return this.listView?.itemByIndex(currentIndex);
  }

  get prevEnabled() {
    let currentIndex = this.rowIndex;
    while (this.listView?.itemByIndex(--currentIndex)?.hasAttribute('disabled')) continue;
    return this.listView?.itemByIndex(currentIndex);
  }

  get data() {
    // return this.listView?.data ?? [];
    return this.listView?.datasource?.currentData ?? this.listView?.data ?? [];
  }

  get rowData() {
    const rowData = this.data[this.rowIndex] ?? {
      disabled: this.disabled,
      itemActivated: this.itemActivated,
      itemChecked: this.itemChecked,
      itemSelected: this.itemSelected,
    };

    return { rowIndex: this.rowIndex, ...rowData };
  }

  set rowData(value: Record<string, unknown>) {
    // NOTE: this blocks creating new data for list-views that don't need data
    // NOTE: if this line is removed, then http://localhost:4300/ids-list-view/list-view-items-search.html
    // NOTE: will show broken lines when items are clicked... due to #active, #check etc setting this.rowData
    // TODO: try to remove this line, and allow new data to be created without empty-rows side-effect
    if (!this.data.length) return;

    const newData = {
      ...this.rowData,
      ...value,
    };

    this.data[this.rowIndex] = newData;
    // const html = this.listView?.templateCustomHTML(newData);
    // console.log('html changing', this.rowIndex);
    // if (html) this.innerHTML = html;
  }

  /**
   * Return the attributes we handle as getters/setters
   * @returns {Array} The attributes in an array
   */
  static get attributes() {
    return [
      ...super.attributes,
      attributes.ACTIVE,
      attributes.CHECKED,
      attributes.DISABLED,
      attributes.SELECTED,
      attributes.ROW_INDEX,
    ];
  }

  /**
   * Invoked each time the custom element is appended into a document-connected element.
   */
  connectedCallback() {
    super.connectedCallback();

    if (this.rowIndex < 0) {
      this.rowIndex = this.listView?.itemCount || 0;
      const html = this.listView?.templateCustomHTML?.(this.rowData);
      if (html) this.innerHTML = html;
    }

    this.#attachEventListeners();
    this.#setAttributes();
  }

  /**
   * Invoked each time the custom element is removed from a document-connected element.
   */
  disconnectedCallback() {
    this.#detachEventListeners();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (oldValue === newValue) return;
    if (name === attributes.ACTIVE) this.#active(stringToBool(newValue));
    if (name === attributes.CHECKED) this.#checked(stringToBool(newValue));
    if (name === attributes.DISABLED) this.#disabled(stringToBool(newValue));
    if (name === attributes.SELECTED) this.#selected(stringToBool(newValue));
    if (name === attributes.ROW_INDEX) this.#rowIndex(newValue);
  }

  #active(newValue: boolean) {
    this.rowData = { itemActivated: newValue };

    if (newValue) {
      this.listView?.itemsActive?.forEach((item) => {
        if (item !== this) item.active = false; // deactivate all other list-view-items
      });
      this.#onTab();
    }
  }

  #checked(newValue: boolean) {
    this.rowData = { itemChecked: newValue };

    const checkbox = this.checkbox;
    if (checkbox) checkbox.checked = newValue;

    if (this.selectable && this.selectable !== 'mixed') {
      this.selected = !!newValue;
    }
  }

  #disabled(newValue: boolean) {
    this.rowData = { disabled: newValue };

    if (newValue) {
      this.#detachEventListeners();
    } else {
      this.#attachEventListeners();
    }
  }

  #selected(newValue: boolean) {
    this.rowData = { itemSelected: newValue };

    if (['single', 'multiple'].includes(this.selectable)) {
      const checkbox = this.checkbox;
      if (checkbox && !checkbox.hasAttribute('hide')) checkbox.checked = newValue;
    }

    if (['single', 'mixed'].includes(this.selectable) && newValue) {
      this.listView?.itemsSelected?.forEach((item) => {
        if (item !== this) item.selected = false;
      });
    }

    this.#trigger(newValue ? 'selected' : 'deselected');
    if (newValue) this.#trigger('itemSelect');
  }

  #rowIndex(newValue: string | number) {
    const rowIndex = Number(newValue) >= 0 ? Number(newValue) : -1;
    this.setAttribute('index', String(rowIndex));
    this.setAttribute('aria-posinset', String(rowIndex + 1));
    this.setAttribute('aria-setsize', String(this.listView?.itemCount || -1));
  }

  get checkbox(): IdsCheckbox | undefined {
    return [
      ...this.querySelectorAll<IdsCheckbox>('ids-checkbox'),
      ...(this.shadowRoot?.querySelectorAll<IdsCheckbox>('ids-checkbox') ?? []),
      ...this.querySelectorAll<IdsCheckbox>('input[type="checkbox"]'),
      ...(this.shadowRoot?.querySelectorAll<IdsCheckbox>('input[type="checkbox"]') ?? [])
    ][0] ?? undefined;
  }

  get swappableParent(): IdsSwappableItem | undefined {
    return this.assignedSlot?.closest<IdsSwappableItem>('ids-swappable-item')
      ?? this.closest<IdsSwappableItem>('ids-swappable-item')
      ?? undefined;
  }

  /**
   * Inner template contents
   * @returns {string} The template
   */
  template(): string {
    return `
      <div class="list-item-area">
        ${this.templateCheckbox()}
        <div class="list-item-content">
          <slot></slot>
        </div>
      </div>
    `;
  }

  templateElements() {
    const elements: { [key: string]: HTMLElement } = {};
    const fieldNames = this.listView?.dataKeys ?? Object.keys(this.rowData);

    fieldNames.map((fieldName: string) => {
      const element = this.querySelector<HTMLElement>(`[data-field="${fieldName}"]`);
      if (element) elements[fieldName] = element;
    });

    return elements;
  }

  get checkboxHidden() {
    const listView = this.listView;
    const showCheckbox = listView?.selectable === 'multiple' || listView?.selectable === 'mixed';
    const hideCheckbox = listView?.selectable === 'multiple' && listView?.hideCheckboxes;

    let chekcboxHidden = showCheckbox ? '' : 'hide';
    if (hideCheckbox) chekcboxHidden = 'hide';
    return !!chekcboxHidden;
  }

  /**
   * Helper method to render the list-view-item template
   * @returns {string} html
   */
  templateCheckbox(): string {
    const listView = this.listView;
    if (!listView) return '';

    const rowData = this.rowData;
    const rowIndex = this.rowIndex;

    const hideCheckbox = this.checkboxHidden ? 'hide' : '';
    const checked = rowData.itemSelected ? ' checked' : '';
    const disabled = rowData.disabled ? ' disabled' : '';

    return `
      <ids-checkbox ${hideCheckbox}
        class="list-item-checkbox"
        label="cb-item-${rowIndex}"
        label-state="hidden"
        ${checked}
        ${disabled}>
      </ids-checkbox>
    `;
  }

  /**
   * Set the row index. This index can be used to lazy-load data from IdsListView.data.
   * @param {number} value the index
   */
  set rowIndex(value: number) {
    if (value !== null && value >= 0) {
      this.setAttribute(attributes.ROW_INDEX, String(value));
    } else {
      this.removeAttribute(attributes.ROW_INDEX);
    }
  }

  /**
   * Get the row index. This index can be used to lazy-load data from IdsListView.data.
   * @returns {number} this list-view-item's index in parent IdsListView
   */
  get rowIndex(): number { return Number(this.getAttribute(attributes.ROW_INDEX) ?? -1); }

  /**
   * Wrapper function that adds interface to match dataset interface.
   * @returns {boolean} true/false
   */
  get itemActivated(): boolean { return this.active; }

  /**
   * Get the list-item active state.
   * @returns {boolean} true/false
   */
  get active(): boolean { return this.hasAttribute(attributes.ACTIVE); }

  /**
   * Set the list-item active state.
   * @param {boolean} value true/false
   */
  set active(value: boolean) {
    const newValue = stringToBool(value);
    const oldValue = stringToBool(this.active);
    if (this.disabled || newValue === oldValue) return;
    if (newValue === false && this.listView?.suppressDeactivation) return;

    const vetoed = this.#veto(newValue ? 'beforeitemactivated' : 'beforeitemdeactivated');
    const active = !vetoed && newValue;

    this.toggleAttribute(attributes.ACTIVE, active);
    this.toggleAttribute('activated', active);
  }

  /**
   * Get the list-item disabled state.
   * @returns {boolean} true/false
   */
  get disabled(): boolean { return this.hasAttribute(attributes.DISABLED); }

  /**
   * Set the list-item disabled state.
   * @param {boolean} value true/false
   */
  set disabled(value: boolean) {
    const newValue = stringToBool(value);
    const oldValue = stringToBool(this.disabled);
    if (newValue === oldValue) return;

    this.toggleAttribute(attributes.DISABLED, newValue);
    this.checkbox?.toggleAttribute(attributes.DISABLED, newValue);
  }

  /**
   * Wrapper function that adds interface to match dataset interface.
   * @returns {boolean} true/false
   */
  get itemSelected(): boolean { return this.selected; }

  /**
   * Is this list-item selectable
   * @returns {string} either single, multiple, mixed or empty-string
   */
  get selectable(): string { return String(this.listView?.selectable ?? ''); }

  /**
   * Is this list-item sortable
   * @returns {boolean} true if it is sortable
   */
  get sortable(): boolean { return stringToBool(this.listView?.sortable); }

  /**
   * Wrapper function that adds interface to match dataset interface.
   * @returns {boolean} true/false
   */
  get itemChecked(): boolean { return this.checked; }

  /**
   * Get the list-item checked state.
   * @returns {boolean} true/false
   */
  get checked(): boolean { return this.hasAttribute(attributes.CHECKED); }

  /**
   * Set the list-item checked state.
   * @param {boolean} value true/false
   */
  set checked(value: boolean) {
    const newValue = stringToBool(value);
    const oldValue = stringToBool(this.checked);
    if (this.disabled || newValue === oldValue) return;
    if (newValue === false && this.listView?.suppressDeselection) return;

    const vetoed = this.#veto(newValue ? 'beforeselected' : 'beforedeselected');
    this.toggleAttribute(attributes.CHECKED, !vetoed && newValue);
  }

  /**
   * Get the list-item selected state.
   * @returns {boolean} true/false
   */
  get selected(): boolean { return this.hasAttribute(attributes.SELECTED); }

  /**
   * Set the list-item selected state.
   * @param {boolean} value true/false
   */
  set selected(value: boolean) {
    let selected = false;

    if (this.selectable) {
      const newValue = stringToBool(value);
      const oldValue = stringToBool(this.selected);
      if (this.disabled || newValue === oldValue) return;
      if (newValue === false && this.listView?.suppressDeselection) return;

      const vetoed = this.#veto(newValue ? 'beforeselected' : 'beforedeselected');
      selected = !vetoed && newValue;
    }

    this.toggleAttribute(attributes.SELECTED, selected);
    this.toggleAttribute('aria-selected', selected);
    this.toggleAttribute('hide-selected-color', selected && this.selectable === 'mixed');
  }

  #onClick(e?: Event) {
    if (this.disabled) {
      e?.preventDefault();
      e?.stopPropagation();
      e?.stopImmediatePropagation();
      return;
    }

    this.active = true;

    const selectable = this.selectable;

    if (selectable) {
      if (['single', 'multiple'].includes(selectable)) {
        e?.preventDefault();
      }

      // TODO: some click-handler is preventing this from being reached.
      // meanwhile this.active is set in the focus-handler
      // this.selected = this.sortable ? true : !this.selected;
      this.selected = !this.selected;
    }
  }

  #onTab() {
    this.listView?.itemsTabbable?.forEach((item) => {
      item.tabIndex = -1;
      item.setAttribute('tabindex', '-1');
    });

    if (this.active) {
      this.tabIndex = 0;
      this.setAttribute('tabindex', '0');

      this.listView?.body?.setAttribute('aria-activedescendant', String(this.rowIndex));
      this.focus();
    }
  }

  #attachEventListeners() {
    this.#detachEventListeners();

    this.onEvent('blur.listview-item', this, () => { this.active = false; });

    this.onEvent('focus.listview-item', this, () => {
      this.active = true;
    });

    this.onEvent('click.listview-item', this, (e) => this.#onClick(e));

    this.onEvent('keyup.listview-selection', this, (e: KeyboardEvent) => {
      const keyCode = String(e.code).trim() || 'Space';
      if (['Space', 'Enter'].includes(keyCode)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        this.#onClick(e);
      }
    });

    this.onEvent('click.listview-checkbox-veto', this.checkbox, (evt) => {
      const vetoed = this.#veto(this.checkbox?.checked ? 'beforedeselected' : 'beforeselected');

      if (vetoed) {
        evt.preventDefault();
        evt.stopImmediatePropagation();
      }
    });

    this.onEvent('change.listview-checkbox', this.checkbox, () => {
      this.checked = Boolean(this.checkbox?.checked);
    });
  }

  #detachEventListeners() {
    this.offEvent('blur.listview-item');
    this.offEvent('focus.listview-item');
    this.offEvent('click.listview-item');
    this.offEvent('keyup.listview-selection');
    this.offEvent('click.listview-checkbox-veto');
    this.offEvent('change.listview-checkbox');
  }

  #setAttributes() {
    const listView = this.listView;
    const rowData = this.rowData;

    this.classList.toggle('sortable', !!listView.sortable);

    this.active = !!rowData.itemActivated;
    this.disabled = !!rowData.disabled;
    this.selected = !!rowData.itemSelected;

    this.tabIndex = -1;
    this.setAttribute('tabindex', '-1');

    this.setAttribute('role', 'option');
    this.setAttribute('aria-setsize', String(this.listView?.itemCount || -1));
  }

  #trigger(eventName: 'selected' | 'deselected' | 'itemSelect') {
    const detail = { elem: this, data: this.rowData, index: this.rowIndex };
    this.triggerEvent(eventName, this.listView ?? this, { bubbles: true, detail });
  }

  #veto(eventName: 'beforeitemactivated' | 'beforeitemdeactivated' | 'beforeselected' | 'beforedeselected') {
    const allowed = !this.listView ? true : this.listView.triggerVetoableEvent?.(eventName, {
      index: this.rowIndex,
      item: this,
      data: this.rowData,
    });

    return !allowed;
  }
}
