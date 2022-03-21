import { customElement, scss } from '../../core/ids-decorators';
import { attributes } from '../../core/ids-attributes';

import Base from './ids-month-view-base';

// Import Utils
import {
  addDate,
  daysDiff,
  daysInMonth,
  firstDayOfMonthDate,
  firstDayOfWeekDate,
  gregorianToUmalqura,
  isValidDate,
  lastDayOfMonthDate,
  subtractDate,
  umalquraToGregorian,
  weeksInMonth,
  weeksInRange,
} from '../../utils/ids-date-utils/ids-date-utils';
import {
  stringToBool,
  stringToNumber,
  buildClassAttrib,
} from '../../utils/ids-string-utils/ids-string-utils';
import { getClosest } from '../../utils/ids-dom-utils/ids-dom-utils';
import { deepClone } from '../../utils/ids-deep-clone-utils/ids-deep-clone-utils';

// Supporting components
import IdsButton from '../ids-button/ids-button';
// eslint-disable-next-line import/no-cycle
import IdsDatePicker from '../ids-date-picker/ids-date-picker';
import IdsIcon from '../ids-icon/ids-icon';
import IdsText from '../ids-text/ids-text';
import IdsToolbar from '../ids-toolbar/ids-toolbar';
import IdsTriggerButton from '../ids-trigger-field/ids-trigger-button';

// Import Styles
import styles from './ids-month-view.scss';

const MIN_MONTH = 0;
const MAX_MONTH = 11;
const WEEK_LENGTH = 7;

/**
 * IDS Month View Component
 * @type {IdsMonthView}
 * @inherits IdsElement
 * @mixes IdsLocaleMixin
 * @mixes IdsEventsMixin
 * @mixes IdsThemeMixin
 */
@customElement('ids-month-view')
@scss(styles)
class IdsMonthView extends Base {
  constructor() {
    super();
  }

  connectedCallback() {
    this.#attachEventHandlers();
    this.#attachKeyboardListeners();
    super.connectedCallback();
  }

  #currentLegend = [];

  #rangeSettings = {
    start: null,
    end: null,
    separator: ' - ',
    minDays: 0,
    maxDays: 0,
    selectForward: false,
    selectBackward: false,
    includeDisabled: false
  };

  /**
   * Return the attributes we handle as getters/setters
   * @returns {Array} The attributes in an array
   */
  static get attributes() {
    return [
      ...super.attributes,
      attributes.COMPACT,
      attributes.DAY,
      attributes.END_DATE,
      attributes.FIRST_DAY_OF_WEEK,
      attributes.IS_DATEPICKER,
      attributes.MONTH,
      attributes.SHOW_TODAY,
      attributes.START_DATE,
      attributes.USE_RANGE,
      attributes.YEAR,
    ];
  }

  /**
   * Inner template contents
   * @returns {string} The template
   */
  template() {
    return `<div class="ids-month-view ${this.compact ? 'is-compact' : 'is-fullsize'}${this.isDatePicker ? ' is-date-picker' : ''}">
      <div class="month-view-container">
        <table class="month-view-table" aria-label="${this.locale?.translate('Calendar')}" role="application">
          <thead class="month-view-table-header">
            <tr></tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>`;
  }

  /**
   * Establish internal event handlers
   * @returns {object} The object for chaining
   */
  #attachEventHandlers() {
    // Respond to container changing language
    this.offEvent('languagechange.month-view-container');
    this.onEvent('languagechange.month-view-container', getClosest(this, 'ids-container'), () => {
      this.setDirection();
      this.#renderToolbar();
      this.#renderMonth();
    });

    // Respond to container changing locale
    this.offEvent('localechange.month-view-container');
    this.onEvent('localechange.month-view-container', getClosest(this, 'ids-container'), () => {
      this.setDirection();
      this.#renderMonth();
      this.#attachDatepicker();
    });

    // Day select event
    this.offEvent('click.month-view-dayselect');
    this.onEvent('click.month-view-dayselect', this.container.querySelector('tbody'), (e) => {
      this.#daySelectClick(e.target.closest('td'));
    });

    // Range selection event
    this.offEvent('mouseover.month-view-range');
    this.onEvent('mouseover.month-view-range', this.container.querySelector('tbody'), (e) => {
      this.#rangeHover(e.target.closest('td'));
    });

    // Clear range when hover outside
    this.offEvent('mouseleave.month-view-range');
    this.onEvent('mouseleave.month-view-range', this.container.querySelector('tbody'), () => {
      this.container.querySelectorAll('td')
        .forEach((item) => item.classList.remove('range-next', 'range-prev'));
    });

    return this;
  }

  /**
   * Establish Internal Keyboard shortcuts
   * @returns {object} this class-instance object for chaining
   */
  #attachKeyboardListeners() {
    // Group key codes to stop keyboard event, trigger dayselected event and focus active day
    const keys = [33, 34, 35, 36, 37, 38, 39, 40, 187, 189];

    // Range calendar doesn't have keyboard shortcuts
    if (this.#isDisplayRange()) {
      this.offEvent('keydown.month-view-keyboard');
    } else {
      this.offEvent('keydown.month-view-keyboard');
      this.onEvent('keydown.month-view-keyboard', this.container.querySelector('.month-view-table'), (e) => {
        const key = e.keyCode;

        if (keys.includes(key)) {
          e.stopPropagation();
          e.stopImmediatePropagation();
          e.preventDefault();
        }

        // Arrow Up selects same day previous week
        if (key === 38) {
          this.#changeDate('previous-week');
        }

        // Arrow Down selects same day next week
        if (key === 40) {
          this.#changeDate('next-week');
        }

        // Arrow Right or + key selects next day
        if (key === 39 || (key === 187 && e.shiftKey)) {
          this.#changeDate('next-day');
        }

        // Arrow Left or - key selects previous day
        if (key === 37 || (key === 189 && !e.shiftKey)) {
          this.#changeDate('previous-day');
        }

        // Page Up selects same day previous month
        if (key === 33 && !e.altKey && !(e.ctrlKey || e.metaKey)) {
          this.#changeDate('previous-month');
        }

        // Page Down selects same day next month
        if (key === 34 && !e.altKey && !(e.ctrlKey || e.metaKey)) {
          this.#changeDate('next-month');
        }

        // ctrl + Page Up selects same day previous year
        if (key === 33 && (e.ctrlKey || e.metaKey)) {
          this.#changeDate('previous-year');
        }

        // ctrl + Page Down selects same day next year
        if (key === 34 && (e.ctrlKey || e.metaKey)) {
          this.#changeDate('next-year');
        }

        // Home moves to start of the month
        if (key === 36) {
          this.#changeDate('start-month');
        }

        // End moves to end of the month
        if (key === 35) {
          this.#changeDate('end-month');
        }

        // 't' selects today
        if (key === 84) {
          this.#changeDate('today');
        }

        // Add keys including Enter or Space triggers dayselected event in regular calendar
        if (((keys.includes(key) || key === 84) && !this.isDatePicker) || (key === 32 || key === 13)) {
          this.#triggerSelectedEvent();
        }

        if (keys.includes(key) || key === 84) {
          this.focus();
        }
      });
    }

    return this;
  }

  /**
   * Add/Remove toolbar HTML to container
   */
  #renderToolbar() {
    if (this.#isDisplayRange()) {
      this.container.querySelector('ids-toolbar')?.remove();
      this.#detachToolbarEvents();

      return;
    }

    const prevNextBtn = `<ids-button class="btn-previous">
      <ids-text audible="true" translate-text="true">PreviousMonth</ids-text>
      <ids-icon slot="icon" icon="chevron-left"></ids-icon>
    </ids-button>
    <ids-button class="btn-next">
      <ids-text audible="true" translate-text="true">NextMonth</ids-text>
      <ids-icon slot="icon" icon="chevron-right"></ids-icon>
    </ids-button>`;
    const todayBtn = this.showToday ? `<ids-button css-class="no-padding" class="btn-today">
      <ids-text
        class="month-view-btn-text"
        font-size="16"
        translate-text="true"
        font-weight="bold"
      >Today</ids-text>
    </ids-button>` : '';

    const toolbarTemplate = `<ids-toolbar class="month-view-header" tabbable="true">
      ${!this.compact ? `
        <ids-toolbar-section type="buttonset">
          ${prevNextBtn}
          <ids-date-picker
            is-calendar-toolbar="true"
            value="${this.#formatMonthText()}"
            month="${this.month}"
            year="${this.year}"
            day="${this.day}"
            first-day-of-week="${this.firstDayOfWeek}"
            show-today=${this.showToday}"
          ></ids-date-picker>
          ${todayBtn}
        </ids-toolbar-section>
      ` : `
        <ids-toolbar-section favor>
          <div class="datepicker-section">
            ${!this.isDatePicker ? `
              <ids-trigger-button>
                <ids-text audible="true" translate-text="true">DatePickerTriggerButton</ids-text>
                <ids-icon slot="icon" icon="schedule" class="trigger-icon"></ids-icon>
              </ids-trigger-button>
            ` : ''}
            <ids-date-picker
              is-dropdown="true"
              value="${this.#formatMonthText()}"
              year="${this.year}"
              month="${this.month}"
            ></ids-date-picker>
          </div>
        </ids-toolbar-section>
        <ids-toolbar-section align="end" type="buttonset">
          ${todayBtn}
          ${prevNextBtn}
          ${!this.isDatePicker ? `
            <ids-button css-class="no-padding" class="btn-apply" hidden="true">
              <ids-text
                class="month-view-btn-text"
                font-size="16"
                translate-text="true"
                font-weight="bold"
              >Apply</ids-text>
            </ids-button>
          ` : ''}
        </ids-toolbar-section>
      `}
    </ids-toolbar>`;

    // Clear/add HTML
    this.container.querySelector('ids-toolbar')?.remove();
    this.container.insertAdjacentHTML('afterbegin', toolbarTemplate);

    // Toolbar events
    this.#attachToolbarEvents();
  }

  /**
   * Add next/previous/today click events when toolbar is attached
   */
  #attachToolbarEvents() {
    const buttonSet = this.container.querySelector('ids-toolbar-section[type="buttonset"]');
    const toolbarDatepicker = this.container.querySelector('ids-date-picker');

    this.offEvent('click.month-view-buttons');
    this.onEvent('click.month-view-buttons', buttonSet, (e) => {
      e.stopPropagation();

      if (e.target?.classList.contains('btn-previous')) {
        this.#changeDate('previous-month');
      }

      if (e.target?.classList.contains('btn-next')) {
        this.#changeDate('next-month');
      }

      if (e.target?.classList.contains('btn-today')) {
        this.#changeDate('today');

        this.focus();
        this.#triggerSelectedEvent();
      }

      if (e.target?.classList.contains('btn-apply')) {
        const { year, month } = toolbarDatepicker;

        this.year = year;
        this.month = month;

        toolbarDatepicker.expanded = false;

        this.#triggerSelectedEvent();
      }
    });

    this.offEvent('dayselected.month-view-datepicker');
    this.onEvent('dayselected.month-view-datepicker', toolbarDatepicker, (e) => {
      const date = e.detail.date;

      this.day = date.getDate();
      this.year = date.getFullYear();
      this.month = date.getMonth();
    });

    // Date picker dropdown picklist expanded or collapsed
    this.offEvent('expanded.month-view-picklist');
    this.onEvent('expanded.month-view-picklist', toolbarDatepicker, (e) => {
      const expanded = e.detail.expanded;

      this.container.querySelector('.btn-today')?.setAttribute('hidden', expanded);
      this.container.querySelector('.btn-apply')?.setAttribute('hidden', !expanded);
      this.container.querySelector('.btn-previous')?.setAttribute(this.isDatePicker ? 'disabled' : 'hidden', expanded);
      this.container.querySelector('.btn-next')?.setAttribute(this.isDatePicker ? 'disabled' : 'hidden', expanded);
      this.#selectDay(!expanded && this.year, !expanded && this.month, !expanded && this.day);
    });
  }

  /**
   * Remove calendar toolbar events when showing range of dates
   */
  #detachToolbarEvents() {
    this.offEvent('click.month-view-buttons');
    this.offEvent('dayselected.month-view-datepicker');
  }

  /**
   * Add/remove legend HTML to the container
   */
  #renderLegend() {
    const template = this.legend.length > 0 ? `
      <div class="month-view-legend">
        ${this.legend.map((item) => `
          <div class="month-view-legend-item">
            <span class="month-view-legend-swatch" data-color="${item.color}"></span>
            <ids-text class="month-view-legend-text">${item.name}</ids-text>
          </div>
        `).join('')}
      </div>
    ` : '';

    // Clear/add HTML
    this.container.querySelector('.month-view-legend')?.remove();
    this.container.querySelector('.month-view-container')
      .insertAdjacentHTML('beforeend', template);

    this.#colorToVar();
  }

  /**
   * Helper to format datepicker text in the toolbar
   * @returns {string} locale formatted month year
   */
  #formatMonthText() {
    return this.locale?.formatDate(this.activeDate, { month: 'long', year: 'numeric', numberingSystem: 'latn' });
  }

  /**
   * Datepicker changing locale formatted text
   */
  #attachDatepicker() {
    const text = this.#formatMonthText();
    const datepicker = this.container.querySelector('ids-date-picker');

    if (!this.#isDisplayRange() && datepicker) {
      datepicker.value = text;
      datepicker.month = this.month;
      datepicker.year = this.year;
      datepicker.day = this.day;
      datepicker.firstDayOfWeek = this.firstDayOfWeek;
      datepicker.showToday = this.showToday;
    }
  }

  /**
   * Change month/year/day by event type
   * @param {string} type of event to be called
   */
  #changeDate(type) {
    if (type === 'next-month') {
      if (this.locale?.isIslamic()) {
        const umalqura = gregorianToUmalqura(this.activeDate);
        const year = umalqura.month === MAX_MONTH ? umalqura.year + 1 : umalqura.year;
        const month = umalqura.month === MAX_MONTH ? MIN_MONTH : umalqura.month + 1;
        const gregorian = umalquraToGregorian(year, month, umalqura.day === 30 ? 1 : umalqura.day);

        this.day = gregorian.getDate();
        this.year = gregorian.getFullYear();
        this.month = gregorian.getMonth();
      } else {
        this.year = this.month === MAX_MONTH ? this.year + 1 : this.year;
        this.month = this.month === MAX_MONTH ? MIN_MONTH : this.month + 1;
        this.day = this.#getDayInMonth(this.day);
      }
    }

    if (type === 'previous-month') {
      if (this.locale?.isIslamic()) {
        const umalqura = gregorianToUmalqura(this.activeDate);
        const year = umalqura.month === MIN_MONTH ? umalqura.year - 1 : umalqura.year;
        const month = umalqura.month === MIN_MONTH ? MAX_MONTH : umalqura.month - 1;
        const gregorian = umalquraToGregorian(year, month, umalqura.day === 30 ? 1 : umalqura.day);

        this.day = gregorian.getDate();
        this.year = gregorian.getFullYear();
        this.month = gregorian.getMonth();
      } else {
        this.year = this.month === MIN_MONTH ? this.year - 1 : this.year;
        this.month = this.month === MIN_MONTH ? MAX_MONTH : this.month - 1;
        this.day = this.#getDayInMonth(this.day);
      }
    }

    if (type === 'next-day') {
      const lastDayOfMonth = lastDayOfMonthDate(this.year, this.month, this.day, this.locale?.isIslamic());

      if (this.locale?.isIslamic()) {
        const nextDate = addDate(this.activeDate, 1, 'days');

        this.day = nextDate.getDate();
        this.year = nextDate.getFullYear();
        this.month = nextDate.getMonth();

        return;
      }

      // Next month/year with rerender
      if (lastDayOfMonth.getDate() === this.day) {
        const nextDate = addDate(lastDayOfMonth, 1, 'days');

        this.year = nextDate.getFullYear();
        this.month = nextDate.getMonth();
        this.day = nextDate.getDate();
      } else {
        // Just increase day without rerender
        this.day += 1;
      }
    }

    if (type === 'previous-day') {
      const firstDayOfMonth = firstDayOfMonthDate(this.year, this.month, this.day, this.locale?.isIslamic());

      if (this.locale?.isIslamic()) {
        const prevDate = subtractDate(this.activeDate, 1, 'days');

        this.day = prevDate.getDate();
        this.year = prevDate.getFullYear();
        this.month = prevDate.getMonth();

        return;
      }

      // Previous month/year with rerender
      if (firstDayOfMonth.getDate() === this.day) {
        const prevDate = subtractDate(firstDayOfMonth, 1, 'days');

        this.year = prevDate.getFullYear();
        this.month = prevDate.getMonth();
        this.day = prevDate.getDate();
      } else {
        // Just decrease day without rerender
        this.day -= 1;
      }
    }

    if (type === 'next-year') {
      if (this.locale?.isIslamic()) {
        const umalqura = gregorianToUmalqura(this.activeDate);
        const gregorian = umalquraToGregorian(
          umalqura.year + 1,
          umalqura.month,
          umalqura.day === 30 ? 1 : umalqura.day
        );

        this.day = gregorian.getDate();
        this.month = gregorian.getMonth();
        this.year = gregorian.getFullYear();
      } else {
        this.year += 1;
        this.day = this.#getDayInMonth(this.day);
      }
    }

    if (type === 'previous-year') {
      if (this.locale?.isIslamic()) {
        const umalqura = gregorianToUmalqura(this.activeDate);
        const gregorian = umalquraToGregorian(
          umalqura.year - 1,
          umalqura.month,
          umalqura.day === 30 ? 1 : umalqura.day
        );

        this.day = gregorian.getDate();
        this.month = gregorian.getMonth();
        this.year = gregorian.getFullYear();
      } else {
        this.year -= 1;
        this.day = this.#getDayInMonth(this.day);
      }
    }

    if (type === 'today') {
      const now = new Date();

      this.day = now.getDate();
      this.year = now.getFullYear();
      this.month = now.getMonth();
    }

    if (type === 'next-week') {
      const nextWeek = addDate(this.activeDate, WEEK_LENGTH, 'days');
      const lastDayOfMonth = lastDayOfMonthDate(this.year, this.month, this.day, this.locale?.isIslamic());

      this.day = nextWeek.getDate();

      if (nextWeek > lastDayOfMonth || this.locale?.isIslamic()) {
        this.year = nextWeek.getFullYear();
        this.month = nextWeek.getMonth();
      }
    }

    if (type === 'previous-week') {
      const prevWeek = subtractDate(this.activeDate, WEEK_LENGTH, 'days');
      const firstDayOfMonth = firstDayOfMonthDate(this.year, this.month, this.day, this.locale?.isIslamic());

      this.day = prevWeek.getDate();

      if (prevWeek < firstDayOfMonth || this.locale?.isIslamic()) {
        this.year = prevWeek.getFullYear();
        this.month = prevWeek.getMonth();
      }
    }

    if (type === 'start-month') {
      const firstDayOfMonth = firstDayOfMonthDate(this.year, this.month, this.day, this.locale?.isIslamic());

      this.day = firstDayOfMonth.getDate();

      if (this.locale?.isIslamic()) {
        this.year = firstDayOfMonth.getFullYear();
        this.month = firstDayOfMonth.getMonth();
      }
    }

    if (type === 'end-month') {
      const lastDayOfMonth = lastDayOfMonthDate(this.year, this.month, this.day, this.locale?.isIslamic());

      this.day = lastDayOfMonth.getDate();

      if (this.locale?.isIslamic()) {
        this.month = lastDayOfMonth.getMonth();
        this.year = lastDayOfMonth.getFullYear();
      }
    }

    this.#attachDatepicker();
  }

  /**
   * Day cell clicked
   * @param {HTMLElement} element The element.
   */
  #daySelectClick(element) {
    if (!element) return;

    const { month, year, day } = element.dataset;
    const isDisabled = element.classList.contains('is-disabled');

    if (!isDisabled) {
      this.#setRangeSelection(year, month, day);

      this.day = day;

      if (stringToNumber(month) !== this.month || this.locale?.isIslamic()) {
        this.month = month;
      }

      if (stringToNumber(year) !== this.year || this.locale?.isIslamic()) {
        this.year = year;
      }

      this.focus();
      this.#triggerSelectedEvent();
    }
  }

  #setRangeSelection(year, month, day) {
    if (!this.useRange) return;

    const dateTime = new Date(year, month, day).getTime();

    this.#selectDay(year, month, day);

    // Start is set
    if (this.rangeSettings.start && !this.rangeSettings.end) {
      const startRange = new Date(this.rangeSettings.start).getTime();

      this.rangeSettings.end = dateTime >= startRange ? dateTime : this.rangeSettings.start;
      this.rangeSettings.start = dateTime <= startRange ? dateTime : this.rangeSettings.start;

      this.#renderRangeSelection();

    // Start not set or both not set
    } else {
      this.rangeSettings.start = dateTime;
      this.rangeSettings.end = null;

      this.#clearRangeClasses();
    }
  }

  #clearRangeClasses() {
    this.container.querySelectorAll('td')
      .forEach((item) => item.classList.remove('range-next', 'range-prev', 'range-selection'));
  }

  #renderRangeSelection() {
    const startRange = new Date(this.rangeSettings.start);
    const endRange = new Date(this.rangeSettings.end);
    const days = this.rangeSettings.end ? daysDiff(startRange, endRange) : 0;

    this.#clearRangeClasses();

    Array.from({ length: days + 1 }).forEach((_, index) => {
      const rangeDay = addDate(startRange, index, 'days');
      const selectedQuery = [
        'td',
        `[data-year="${rangeDay.getFullYear()}"]`,
        `[data-month="${rangeDay.getMonth()}"]`,
        `[data-day="${rangeDay.getDate()}"]`
      ].join('');
      const element = this.container.querySelector(selectedQuery);

      element?.classList.add('range-selection');

      if (index === 0 || index === days) {
        element?.setAttribute('aria-selected', true);
        element?.setAttribute('role', 'gridcell');
        element?.classList.add('is-selected');
      }
    });
  }

  #isRangeByDate(date) {
    const startRange = new Date(this.rangeSettings.start);
    const endRange = new Date(this.rangeSettings.end);

    return date.getTime() >= startRange.getTime()
      && date.getTime() <= endRange.getTime();
  }

  #rangeHover(element) {
    if (!element || !this.useRange) return;

    if (this.rangeSettings.start && !(this.rangeSettings.end && this.rangeSettings.start)) {
      const { year, month, day } = element.dataset;
      const startRange = new Date(this.rangeSettings.start);
      const endRange = new Date(year, month, day);
      const days = daysDiff(startRange, endRange);

      this.#clearRangeClasses();

      if (days !== 0) {
        Array.from({ length: Math.abs(days) }).forEach((_, index) => {
          const rangeDay = days > 0
            ? addDate(startRange, index + 1, 'days')
            : subtractDate(startRange, index + 1, 'days');
          const selectedQuery = [
            'td',
            `[data-year="${rangeDay.getFullYear()}"]`,
            `[data-month="${rangeDay.getMonth()}"]`,
            `[data-day="${rangeDay.getDate()}"]`
          ].join('');

          this.container.querySelector(selectedQuery)
            ?.classList.add(days > 0 ? 'range-next' : 'range-prev');
        });
      }
    }
  }

  /**
   * Helper to get month format for first day of a month or first day of the range
   * @param {Date} date date to check
   * @param {Date} rangeStartsOn very first day of the range
   * @returns {string|undefined} Intl.DateTimeFormat options month format (numeric, long, short)
   */
  #monthInDayFormat(date, rangeStartsOn) {
    const isFirstDayOfRange = daysDiff(date, rangeStartsOn) === 0;
    const isFirstDayOfMonth = this.locale?.isIslamic()
      ? gregorianToUmalqura(date).day === 1
      : date.getDate() === 1;

    if (this.#isDisplayRange() && (isFirstDayOfRange || isFirstDayOfMonth)) {
      return 'short';
    }

    return undefined;
  }

  /**
   * Table cell HTML template with locale, data attributes
   * @param {number} weekIndex number of week in month starting from 0
   * @returns {string} table cell HTML template
   */
  #getCellTemplate(weekIndex) {
    const firstDayOfRange = this.#isDisplayRange()
      ? this.startDate
      : firstDayOfMonthDate(this.year, this.month, this.day, this.locale?.isIslamic());
    const lastDayOfRange = this.#isDisplayRange()
      ? this.endDate
      : lastDayOfMonthDate(this.year, this.month, this.day, this.locale?.isIslamic());
    const rangeStartsOn = firstDayOfWeekDate(firstDayOfRange, this.firstDayOfWeek);

    return Array.from({ length: WEEK_LENGTH }).map((_, index) => {
      const date = addDate(rangeStartsOn, (weekIndex * WEEK_LENGTH) + index, 'days');
      const monthFormat = this.#monthInDayFormat(date, rangeStartsOn);
      const dayText = this.locale?.formatDate(date, {
        day: 'numeric',
        month: monthFormat,
        numberingSystem: 'latn'
      });
      const ariaLabel = this.locale?.formatDate(date, { dateStyle: 'full' });
      const day = date.getDate();
      const month = date.getMonth();
      const year = date.getFullYear();
      const isSelected = (this.useRange && !this.rangeSettings.start)
        && (day === this.day && year === this.year && month === this.month);
      const isDisabled = this.#isRange() && (date < this.startDate || date > this.endDate);
      const isAlternate = !this.#isRange() && (date < firstDayOfRange || date > lastDayOfRange);
      const legend = this.#getLegendByDate(date);
      const isRangeSelection = this.#isRangeByDate(date);
      const classAttr = buildClassAttrib(
        isAlternate && 'alternate',
        legend && 'has-legend',
        isDisabled && 'is-disabled',
        isSelected && 'is-selected',
        monthFormat && 'month-label',
        isRangeSelection && 'range-selection'
      );
      const selectedAttr = isSelected ? 'aria-selected="true" tabindex="0" role="gridcell"' : 'role="link"';
      const dataAttr = [`data-year="${year}"`, `data-month="${month}"`, `data-day="${day}"`].join(' ');
      const colorAttr = legend ? `data-color="${legend.color}"` : '';

      return `<td aria-label="${ariaLabel}" ${dataAttr} ${classAttr} ${selectedAttr} ${colorAttr}>
        <span class="day-container">
          <ids-text
            aria-hidden="true"
            class="day-text"
            font-size="14"
          >${dayText}</ids-text>
        </span>
      </td>`;
    }).join('');
  }

  /**
   * Add week days HTML to the table
   */
  #renderWeekDays() {
    if (!this.locale) return;

    const calendar = this.locale.calendar();
    const weekDays = this.compact ? calendar.days.narrow : calendar.days.abbreviated;

    const weekDaysTemplate = weekDays.map((_, index) => {
      const weekday = weekDays[(index + this.firstDayOfWeek) % WEEK_LENGTH];

      return `
        <th>
          <ids-text
            class="weekday-text"
            font-size="14"
          >${weekday}</ids-text>
        </th>
      `;
    }).join('');

    // Clear/add HTML
    this.container.querySelectorAll('thead th').forEach((el) => el.remove());
    this.container.querySelector('thead tr').insertAdjacentHTML('beforeend', weekDaysTemplate);
  }

  /**
   * Add month HTML to the table
   */
  #renderMonth() {
    const weeksCount = this.#isDisplayRange()
      ? weeksInRange(this.startDate, this.endDate, this.firstDayOfWeek)
      : weeksInMonth(this.year, this.month, this.day, this.firstDayOfWeek, this.locale?.isIslamic());

    const rowsTemplate = Array.from({ length: weeksCount }).map((_, weekIndex) =>
      `<tr>${this.#getCellTemplate(weekIndex)}</tr>`).join('');

    // Clear/add HTML
    this.container.querySelectorAll('tbody tr').forEach((el) => el.remove());
    this.container.querySelector('tbody').insertAdjacentHTML('beforeend', rowsTemplate);

    this.#renderWeekDays();
    this.#colorToVar();
  }

  /**
   * Trigger selected event with current params
   * @returns {void}
   */
  #triggerSelectedEvent() {
    const args = {
      detail: {
        elem: this,
        date: this.activeDate,
        useRange: this.useRange,
        rangeStart: new Date(this.rangeSettings.start),
        rangeEnd: new Date(this.rangeSettings.end)
      }
    };

    // Fires on any day selected in regular mode and
    // only when start/end of range is set in range mode
    if (!this.useRange || (this.rangeSettings.start && this.rangeSettings.end)) {
      this.triggerEvent('dayselected', this, args);
    }
  }

  /**
   * Add selectable attribute to active day
   * @param {number} year a given year
   * @param {number} month a given month
   * @param {number} day a given day
   */
  #selectDay(year, month, day) {
    // Clear before
    this.container.querySelectorAll('td.is-selected')?.forEach((item) => {
      item?.removeAttribute('aria-selected');
      item?.removeAttribute('tabindex');
      item?.setAttribute('role', 'link');
      item?.classList.remove('is-selected');
    });
    const selectedQuery = `td[data-year="${year}"][data-month="${month}"][data-day="${day}"]`;
    const selected = this.container.querySelector(selectedQuery);

    // Selectable attributes
    selected?.setAttribute('tabindex', 0);
    selected?.setAttribute('aria-selected', true);
    selected?.setAttribute('role', 'gridcell');
    selected?.classList.add('is-selected');
  }

  /**
   * Whether or not it should show range of dates instead of one month view
   * @returns {boolean} startDate and endDate are set
   */
  #isDisplayRange() {
    return this.startDate && this.endDate && this.endDate >= this.startDate;
  }

  /**
   * Helper to check if the month has a day
   * @param {number} day to check
   * @returns {number} day of the month either active or first
   */
  #getDayInMonth(day) {
    const numberOfDays = daysInMonth(this.year, this.month);

    return day > numberOfDays ? 1 : day;
  }

  /**
   * Find legend object by date provided
   * @param {Date} date to check if has any legend
   * @returns {object} legend object for a specific date
   */
  #getLegendByDate(date) {
    return this.legend.find((legend) => {
      const ifDayOfWeek = legend.dayOfWeek?.includes(date.getDay());
      const ifDate = legend.dates?.some((item) => new Date(item).getTime() === date.getTime());

      return ifDayOfWeek || ifDate;
    });
  }

  /**
   * Iterate legend items with color data and add color css variable
   */
  #colorToVar() {
    this.container.querySelectorAll('[data-color]')
      .forEach((el) => {
        const color = el.dataset.color;
        const isHex = color?.includes('#');

        if (color) {
          el.style = `--legend-color: ${isHex ? color : `var(--ids-color-palette-${color})`}`;
        }
      });
  }

  /**
   * Focuses the active/selected day
   * @returns {void}
   */
  focus() {
    this.container.querySelector('td.is-selected')?.focus();
  }

  /**
   * Get active/selected day in Date format
   * @readonly
   * @returns {Date} active date
   */
  get activeDate() {
    return new Date(this.year, this.month, this.day);
  }

  /**
   * show-today attribute
   * @returns {boolean} showToday param converted to boolean from attribute value
   */
  get showToday() {
    const attrVal = this.getAttribute(attributes.SHOW_TODAY);

    return stringToBool(attrVal);
  }

  /**
   * Set whether or not the today button should be shown
   * @param {string|boolean|null} val showToday param value
   */
  set showToday(val) {
    const boolVal = stringToBool(val);

    if (boolVal) {
      this.setAttribute(attributes.SHOW_TODAY, boolVal);
    } else {
      this.removeAttribute(attributes.SHOW_TODAY);
    }

    this.#renderToolbar();
    this.#attachDatepicker();
  }

  /**
   * month attribute
   * @returns {number} month param converted to number from attribute value with range (MIN_MONTH - MAX_MONTH)
   */
  get month() {
    const attrVal = this.getAttribute(attributes.MONTH);
    const numberVal = stringToNumber(attrVal);

    if (!Number.isNaN(numberVal) && numberVal >= MIN_MONTH && numberVal <= MAX_MONTH) {
      return numberVal;
    }

    // Default is current month
    return new Date().getMonth();
  }

  /**
   * Set month param and render month table/toolbar
   * @param {string|number|null} val month param value
   */
  set month(val) {
    const numberVal = stringToNumber(val);

    if (!Number.isNaN(numberVal) && numberVal >= MIN_MONTH && numberVal <= MAX_MONTH) {
      this.setAttribute(attributes.MONTH, val);
    } else {
      this.removeAttribute(attributes.MONTH);
    }

    // Month change in range calendar doesn't trigger a rerender, just selects a day
    if (this.#isDisplayRange()) {
      this.#selectDay(this.year, this.month, this.day);
    } else {
      this.#renderMonth();
      this.#attachDatepicker();
      this.#renderRangeSelection();
    }
  }

  /**
   * year attribute
   * @returns {number} year param converted to number from attribute value with 4-digit check
   */
  get year() {
    const attrVal = this.getAttribute(attributes.YEAR);
    const numberVal = stringToNumber(attrVal);

    if (!Number.isNaN(numberVal) && attrVal.length === 4) {
      return numberVal;
    }

    // Default is current year
    return new Date().getFullYear();
  }

  /**
   * Set year param and render month table/toolbar
   * @param {string|number|null} val year param value
   */
  set year(val) {
    const numberVal = stringToNumber(val);

    if (!Number.isNaN(numberVal) && numberVal.toString().length === 4) {
      this.setAttribute(attributes.YEAR, val);
    } else {
      this.removeAttribute(attributes.YEAR);
    }

    // Year change in range calendar doesn't trigger a rerender, just selects a day
    if (this.#isDisplayRange()) {
      this.#selectDay(this.year, this.month, this.day);
    } else {
      this.#renderMonth();
      this.#attachDatepicker();
      this.#renderRangeSelection();
    }
  }

  /**
   * day attribute
   * @returns {number} day param converted to number
   */
  get day() {
    const attrVal = this.getAttribute(attributes.DAY);
    const numberVal = stringToNumber(attrVal);

    if (!Number.isNaN(numberVal) && numberVal > 0) {
      return numberVal;
    }

    // Default is current day
    return new Date().getDate();
  }

  /**
   * Set day param and select active day
   * @param {string|number|null} val day param value
   */
  set day(val) {
    const numberVal = stringToNumber(val);
    const validates = !Number.isNaN(numberVal) && numberVal > 0;

    if (validates) {
      this.setAttribute(attributes.DAY, val);
    } else {
      this.removeAttribute(attributes.DAY);
    }

    if (!this.rangeSettings.start || !this.useRange) {
      this.#selectDay(this.year, this.month, validates ? numberVal : this.day);
    }

    if (!this.#isDisplayRange()) {
      this.#attachDatepicker();
    }
  }

  /**
   * start-date attribute
   * @returns {Date} startDate date parsed from attribute value
   */
  get startDate() {
    const attrVal = this.getAttribute(attributes.START_DATE);
    const attrDate = new Date(attrVal);

    if (attrVal && isValidDate(attrDate)) {
      return attrDate;
    }

    return null;
  }

  /**
   * Set start of the range to show
   * @param {string|null} val startDate param value
   */
  set startDate(val) {
    if (val) {
      this.setAttribute(attributes.START_DATE, val);
    } else {
      this.removeAttribute(attributes.START_DATE);
    }

    this.#renderToolbar();
    this.#renderMonth();
    this.#attachKeyboardListeners();
  }

  /**
   * end-date attribute
   * @returns {Date|null} endDate date parsed from attribute value
   */
  get endDate() {
    const attrVal = this.getAttribute(attributes.END_DATE);
    const attrDate = new Date(attrVal);

    if (attrVal && isValidDate(attrDate)) {
      return attrDate;
    }

    return null;
  }

  /**
   * Set end of the range to show
   * @param {string|null} val endDate param value
   */
  set endDate(val) {
    if (val) {
      this.setAttribute(attributes.END_DATE, val);
    } else {
      this.removeAttribute(attributes.END_DATE);
    }

    this.#renderToolbar();
    this.#renderMonth();
    this.#attachKeyboardListeners();
  }

  /**
   * fist-day-of-week attribute
   * @returns {number} firstDayOfWeek param converted to number from attribute value with range (0-6)
   */
  get firstDayOfWeek() {
    const attrVal = this.getAttribute(attributes.FIRST_DAY_OF_WEEK);
    const numberVal = stringToNumber(attrVal);

    if (!Number.isNaN(numberVal) && numberVal >= 0 && numberVal <= 6) {
      return numberVal;
    }

    // Default value
    return 0;
  }

  /**
   * Set first day of the week (0-6)
   * @param {string|number|null} val firstDayOfWeek param value
   */
  set firstDayOfWeek(val) {
    const numberVal = stringToNumber(val);

    if (!Number.isNaN(numberVal)) {
      this.setAttribute(attributes.FIRST_DAY_OF_WEEK, val);
    } else {
      this.removeAttribute(attributes.FIRST_DAY_OF_WEEK);
    }

    this.#renderMonth();
    this.#attachDatepicker();
  }

  /**
   * compact attribute
   * @returns {boolean} compact param converted to boolean from attribute value
   */
  get compact() {
    const attrVal = this.getAttribute(attributes.COMPACT);

    return stringToBool(attrVal);
  }

  /**
   * Set whether or not the component should be compact view
   * @param {string|boolean|null} val compact param value
   */
  set compact(val) {
    const boolVal = stringToBool(val);

    if (boolVal) {
      this.setAttribute(attributes.COMPACT, boolVal);
    } else {
      this.removeAttribute(attributes.COMPACT);
    }

    // Toggle container CSS class
    this.container.classList.toggle('is-fullsize', !boolVal);
    this.container.classList.toggle('is-compact', boolVal);
    // Render related views
    this.#renderToolbar();
    this.#renderWeekDays();
  }

  /**
   * is-date-picker attribute
   * @returns {boolean} isDatePicker param converted to boolean from attribute value
   */
  get isDatePicker() {
    const attrVal = this.getAttribute(attributes.IS_DATEPICKER);

    return stringToBool(attrVal);
  }

  /**
   * Set whether or not the component is used in datepicker popup
   * @param {string|boolean|null} val compact param value
   */
  set isDatePicker(val) {
    const boolVal = stringToBool(val);

    if (boolVal) {
      this.setAttribute(attributes.IS_DATEPICKER, boolVal);
    } else {
      this.removeAttribute(attributes.IS_DATEPICKER);
    }

    // Toggle container CSS class
    this.container.classList.toggle('is-date-picker', boolVal);
  }

  /**
   * @returns {Array} array of legend items
   */
  get legend() {
    return this.#currentLegend;
  }

  /**
   * Set and validate array of legend items
   * Not an empty array of object with name, color, dates or dayOfWeek properties
   * @param {Array|null} val array of legend items
   */
  set legend(val) {
    // Remove legend by setting null
    if (val === null) {
      this.#currentLegend = [];
      this.#renderMonth();
      this.#renderLegend();
      this.container.classList.remove('has-legend');

      return;
    }

    // Check if legend validates
    if (
      Array.isArray(val)
      && val.length > 0
      && val.every(
        (item) => item.name && item.color && (item.dates || item.dayOfWeek)
      )
    ) {
      this.#currentLegend = deepClone(val);
      this.#renderMonth();
      this.#renderLegend();
      this.container.classList.add('has-legend');
    } else {
      throw new Error('ids-month-view: Invalid legend data provided');
    }
  }

  get rangeSettings() {
    return this.#rangeSettings;
  }

  set rangeSettings(val) {
    this.#rangeSettings = {
      ...this.#rangeSettings,
      ...deepClone(val)
    };

    if (this.useRange) {
      this.#selectDay();
    }

    this.#renderRangeSelection();
  }

  get useRange() {
    const attrVal = this.getAttribute(attributes.USE_RANGE);

    return stringToBool(attrVal);
  }

  set useRange(val) {
    const boolVal = stringToBool(val);

    if (boolVal) {
      this.setAttribute(attributes.USE_RANGE, boolVal);
      this.#selectDay();
      this.#renderRangeSelection();
    } else {
      this.removeAttribute(attributes.USE_RANGE);
      this.#clearRangeClasses();
      this.#selectDay(this.year, this.month, this.day);
    }
  }
}

export default IdsMonthView;
