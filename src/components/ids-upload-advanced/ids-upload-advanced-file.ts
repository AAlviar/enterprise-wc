import { customElement, scss } from '../../core/ids-decorators';
import { attributes } from '../../core/ids-attributes';
import { stringToBool, stringToNumber } from '../../utils/ids-string-utils/ids-string-utils';

import Base from './ids-upload-advanced-file-base';

import '../ids-alert/ids-alert';
import '../ids-trigger-field/ids-trigger-button';
import '../ids-progress-bar/ids-progress-bar';
import IdsUploadAdvancedShared from './ids-upload-advanced-shared';

import styles from './ids-upload-advanced-file.scss';

/**
 * IDS UploadAdvancedFile Component
 * @type {IdsUploadAdvancedFile}
 * @inherits IdsElement
 * @mixes IdsEventsMixin
 */
@customElement('ids-upload-advanced-file')
@scss(styles)
export default class IdsUploadAdvancedFile extends Base {
  constructor() {
    super();
  }

  /**
   * Return the attributes we handle as getters/setters
   * @returns {Array} The attributes in an array
   */
  static get attributes() {
    return [
      attributes.DISABLED,
      attributes.ERROR,
      attributes.FILE_NAME,
      attributes.SIZE,
      attributes.VALUE
    ];
  }

  /**
   * Custom Element `connectedCallback` implementation
   * @returns {void}
   */
  connectedCallback() {
    this.#attachEventHandlers();
  }

  /**
   * Inner template contents
   * @returns {string} The template
   */
  template() {
    const toBool = stringToBool;
    const d = IdsUploadAdvancedShared.DEFAULTS;
    const disabled = toBool(this.disabled) ? ' disabled' : '';
    const hiddenArea = `
      <div class="hidden">
        <slot name="text-btn-cancel">${d.textBtnCancel}</slot>
        <slot name="text-btn-close-error">${d.textBtnCloseError}</slot>
        <slot name="text-btn-remove">${d.textBtnRemove}</slot>
        <slot name="text-droparea">${d.textDroparea}</slot>
        <slot name="text-droparea-with-browse">${d.textDropareaWithBrowse}</slot>
        <slot name="text-droparea-with-browse-link">${d.textDropareaWithBrowseLink}</slot>
        <slot name="text-progress-label">${d.textProgressLabel}</slot>
        <slot name="error-accept-file-type">${d.errorAcceptFileType}</slot>
        <slot name="error-max-files">${d.errorMaxFiles}</slot>
        <slot name="error-max-files-in-process">${d.errorMaxFilesInProcess}</slot>
        <slot name="error-max-file-size">${d.errorMaxFileSize}</slot>
        <slot name="error-url">${d.errorUrl}</slot>
      </div>`;

    return `
      <div class="ids-upload-advanced-file${disabled}">
        ${hiddenArea}
        <div class="container">
          <div class="file-row">
            <div class="status">
              <ids-alert class="in-process" icon="in-progress-solid"></ids-alert>
              <ids-alert class="completed" icon="success-solid"></ids-alert>
              <ids-alert class="errored" icon="error-solid"></ids-alert>
            </div>
            <div class="file-name"><span>${this.fileName}</span></div>
            <div class="file-progress"><ids-text class="size">${this.sizeFormatted}</ids-text><div class="progress-text"><span class="bar">|</span><span class="percent">0%</span></div></div>
            <ids-button class="btn-close">
              <span slot="text" class="audible">${this.closeButtonText}</span>
              <ids-icon slot="icon" icon="close" size="xsmall"></ids-icon>
            </ids-button>
          </div>
          <div class="progress-row">
            <ids-progress-bar label="${this.progressLabelText}" label-audible="true" value="${this.value || 0}"></ids-progress-bar>
          </div>
          <div class="error-row">
            <ids-text class="error-msg"></ids-text>
          </div>
        </div>
      </div>`;
  }

  /**
   * Dispatch event
   * @private
   * @param {string} eventName The event name
   * @param {object} e Actual event
   * @returns {void}
   */
  dispatchChangeEvent(eventName: string, e: any = null): void {
    this.triggerEvent(eventName, this, {
      detail: {
        elem: this,
        error: this.errorHtml,
        loaded: this.loaded,
        loadedFormatted: this.loadedFormatted,
        nativeEvent: e,
        size: this.size,
        sizeFormatted: this.sizeFormatted,
        status: this.status,
        value: this.value
      }
    });
  }

  /**
   * Toggle disabled
   * @private
   * @param {boolean|string} value If true will set `disabled`
   * @returns {void}
   */
  toggleDisabled(value: boolean | string): void {
    const el = {
      root: this.shadowRoot.querySelector('.ids-upload-advanced-file'),
      progress: this.shadowRoot.querySelector('ids-progress-bar'),
      btnClose: this.shadowRoot.querySelector('.btn-close'),
      alerts: [].slice.call(this.shadowRoot.querySelectorAll('.status ids-alert')),
    };
    const val = stringToBool(value);
    if (val) {
      el.root?.classList.add(attributes.DISABLED);
      el.progress.setAttribute(attributes.DISABLED, val.toString());
      el.btnClose.setAttribute(attributes.DISABLED, val.toString());
      el.alerts.forEach((alert: HTMLElement) => {
        alert?.setAttribute(attributes.DISABLED, val.toString());
      });
    } else {
      el.root?.classList.remove(attributes.DISABLED);
      el.progress.removeAttribute(attributes.DISABLED);
      el.btnClose.removeAttribute(attributes.DISABLED);
      el.alerts.forEach((alert: HTMLElement) => {
        alert?.removeAttribute(attributes.DISABLED);
      });
    }
  }

  /**
   * Set current status
   * @private
   * @returns {void}
   */
  setStatus(): void {
    if (this.status === IdsUploadAdvancedShared.STATUS.aborted) {
      return;
    }
    const rootEl = this.shadowRoot.querySelector('.ids-upload-advanced-file');
    const progress = this.shadowRoot.querySelector('ids-progress-bar');
    const closeButtonTextEl = this.shadowRoot.querySelector('.btn-close .audible');
    let value = stringToNumber((this.value as any));
    value = value > -1 ? value : 0;
    let shouldTrigger = true;

    if (this.error) {
      const errorMsg = this.shadowRoot.querySelector('.error-row .error-msg');
      if (errorMsg) {
        errorMsg.innerHTML = this.errorHtml;
      }
      if (this.status === IdsUploadAdvancedShared.STATUS.errored) {
        shouldTrigger = false;
      } else {
        this.status = IdsUploadAdvancedShared.STATUS.errored;
      }
    } else if (value < 100) {
      this.status = IdsUploadAdvancedShared.STATUS.inProcess;
    }

    const progressText = this.shadowRoot.querySelector('.progress-text');
    if (progressText) {
      const percentText = progressText.querySelector('.percent');
      percentText.textContent = `${Math.round(value)}%`;

      if (this.status === IdsUploadAdvancedShared.STATUS.completed) {
        progressText.remove();
      }
    }

    closeButtonTextEl.innerHTML = this.closeButtonText;
    progress?.setAttribute(attributes.VALUE, value.toString());
    progress?.setAttribute(attributes.LABEL, this.progressLabelText);
    rootEl?.classList.remove(...Object.values(IdsUploadAdvancedShared.STATUS));
    rootEl?.classList.add(this.status);

    if (shouldTrigger && this.status !== IdsUploadAdvancedShared.STATUS.inProcess) {
      const events: Record<string, string> = { errored: 'error', completed: 'complete' };
      this.dispatchChangeEvent(events[this.status]);
    }
  }

  /**
   * Handle close button click event
   * @private
   * @returns {void}
   */
  handleBtnCloseClickEvent(): void {
    const btnClose = this.shadowRoot?.querySelector('.btn-close');
    this.onEvent('click', btnClose, (e: MouseEvent) => {
      this.abortHandler();
      this.dispatchChangeEvent('closebuttonclick', e);
    });
  }

  /**
   * Handle events
   * @private
   * @returns {void}
   */
  #attachEventHandlers(): void {
    this.handleBtnCloseClickEvent();
  }

  /**
   * Abort handler
   * @param  {any} e The event
   * @returns {void}
   */
  abortHandler(e = null): void {
    if (this.status === IdsUploadAdvancedShared.STATUS.inProcess) {
      this.status = IdsUploadAdvancedShared.STATUS.aborted;
      this.dispatchChangeEvent('abort', e);
    }
  }

  /**
   * Progress handler
   * @param {any} e The event
   * @returns {void}
   */
  progressHandler(e: any): void {
    this.value = (e.loaded / e.total) * 100;
  }

  /**
   * Complete handler
   * @param {any} e The event
   * @returns {void}
   */
  completeHandler(e: any): void {
    if (e.target.readyState === 4 && e.target.status === 200) {
      this.value = '100';
      this.status = IdsUploadAdvancedShared.STATUS.completed;
      this.setStatus();
    } else {
      if (this.value === '100') {
        this.value = '0';
      }
      this.errorHandler(e);
    }
  }

  /**
   * Error handler
   * @param {any} e The event
   * @returns {void}
   */
  errorHandler(e: any): void {
    let err = 'Failed to upload, server issue';
    if (typeof e === 'string' && e !== '') {
      err = e;
    } else if (typeof e === 'object') {
      err = `${e.target.status} - ${e.target.statusText}`;
    }
    this.status = IdsUploadAdvancedShared.STATUS.errored;
    this.error = err;
  }

  /**
   * Get the bytes of the file is uploaded
   * @private
   * @returns {number} The close button text
   */
  get loaded(): number {
    const percent = stringToNumber(this.value);
    const total = stringToNumber(this.size);
    return (percent * total) / 100;
  }

  /**
   * Get the bytes loaded value formatted (for example 10M)
   * @private
   * @returns {string} The close button text
   */
  get loadedFormatted(): string { return IdsUploadAdvancedShared.formatBytes(this.loaded); }

  /**
   * Get formatted size value
   * @private
   * @returns {string} The close button text
   */
  get sizeFormatted(): string {
    return IdsUploadAdvancedShared.formatBytes(stringToNumber(this.size));
  }

  /**
   * Get text for close button
   * @private
   * @returns {string} The close button text
   */
  get closeButtonText(): string {
    let text = IdsUploadAdvancedShared.slotVal(this.shadowRoot, 'text-btn-cancel');
    if (this.status === IdsUploadAdvancedShared.STATUS.errored) {
      text = IdsUploadAdvancedShared.slotVal(this.shadowRoot, 'text-btn-close-error');
    } else if (this.status === IdsUploadAdvancedShared.STATUS.completed) {
      text = IdsUploadAdvancedShared.slotVal(this.shadowRoot, 'text-btn-remove');
    }
    return text;
  }

  /**
   * Get text for progress label
   * @private
   * @returns {string} The progress label text
   */
  get progressLabelText(): string {
    return IdsUploadAdvancedShared.slotVal(this.shadowRoot, 'text-progress-label')
      .replace('{file-name}', this.fileName)
      .replace('{loaded}', this.loadedFormatted.toString())
      .replace('{size}', this.sizeFormatted.toString())
      .replace('{percent}', this.value?.toString());
  }

  /**
   * Get error html
   * @private
   * @returns {string} The error
   */
  get errorHtml(): string {
    const isInSlot = Object.values(IdsUploadAdvancedShared.ERRORS).indexOf((this.error as any)) > -1;
    return isInSlot ? IdsUploadAdvancedShared.slotVal(this.shadowRoot, (this.error as any)) : this.error;
  }

  /**
   * Sets the whole file element to disabled
   * @param {boolean|string} value If true will set disabled attribute
   */
  set disabled(value: string | boolean) {
    const val = stringToBool(value);
    if (val) {
      this.setAttribute(attributes.DISABLED, val.toString());
    } else {
      this.removeAttribute(attributes.DISABLED);
    }
    this.toggleDisabled(value);
  }

  get disabled(): string | boolean { return this.getAttribute(attributes.DISABLED); }

  /**
   * Sets the file state to show there was an error during the file operations
   * @param {string} value error attribute
   */
  set error(value: string | undefined) {
    if (value) {
      this.setAttribute(attributes.ERROR, value.toString());
    } else {
      this.removeAttribute(attributes.ERROR);
    }
    this.setStatus();
  }

  get error(): string | undefined {
    return this.getAttribute(attributes.ERROR);
  }

  /**
   * Sets the file name
   * @param {string | undefined} value file-name attribute
   */
  set fileName(value: string | undefined) {
    if (value) {
      this.setAttribute(attributes.FILE_NAME, value.toString());
      const el = this.shadowRoot.querySelector('.file-name span');
      el.innerHTML = this.fileName;
    } else {
      this.removeAttribute(attributes.FILE_NAME);
    }
  }

  get fileName(): string | undefined {
    return this.getAttribute(attributes.FILE_NAME) || '';
  }

  /**
   * Sets the file size in bytes
   * @param {string|number} value size attribute
   */
  set size(value: string | number | undefined) {
    if (value) {
      this.setAttribute(attributes.SIZE, value.toString());
      const el = this.shadowRoot.querySelector('.size');
      el.innerHTML = this.sizeFormatted;
    } else {
      this.removeAttribute(attributes.SIZE);
    }
  }

  get size(): string | number | undefined { return this.getAttribute(attributes.SIZE); }

  /**
   * Sets the progress bar value
   * @param {string|number| undefined} val value attribute
   */
  set value(val: string | number | undefined) {
    if (val) {
      if (!this.status || this.status === IdsUploadAdvancedShared.STATUS.inProcess) {
        this.setAttribute(attributes.VALUE, val.toString());
      }
    } else {
      this.removeAttribute(attributes.VALUE);
    }
    this.setStatus();
  }

  get value(): string | number | undefined {
    return this.getAttribute(attributes.VALUE);
  }
}
