/**
 * @jest-environment jsdom
 */
import '../helpers/resize-observer-mock';
import IdsDataGrid from '../../src/components/ids-data-grid/ids-data-grid';
import IdsDataGridFormatters from '../../src/components/ids-data-grid/ids-data-grid-formatters';
import IdsContainer from '../../src/components/ids-container/ids-container';
import dataset from '../../src/assets/data/books.json';
import processAnimFrame from '../helpers/process-anim-frame';

import createFromTemplate from '../helpers/create-from-template';
import { deepClone } from '../../src/utils/ids-deep-clone-utils/ids-deep-clone-utils';

describe('IdsDataGrid Component', () => {
  let dataGrid: any;
  let container: any;

  const formatters: any = new IdsDataGridFormatters();
  const columns = () => {
    const cols = [];
    // Set up columns
    cols.push({
      id: 'selectionCheckbox',
      sortable: false,
      resizable: false,
      formatter: formatters.selectionCheckbox,
      align: 'center',
      width: 20
    });
    cols.push({
      id: 'rowNumber',
      name: '#',
      formatter: formatters.rowNumber,
      sortable: false,
      readonly: true,
      width: 65
    });
    cols.push({
      id: 'description',
      name: 'Description',
      field: 'description',
      sortable: true,
      formatter: formatters.text
    });
    cols.push({
      id: 'ledger',
      name: 'Ledger',
      field: 'ledger',
      formatter: formatters.text
    });
    cols.push({
      id: 'publishDate',
      name: 'Pub. Date',
      field: 'publishDate',
      formatter: formatters.date
    });
    cols.push({
      id: 'publishTime',
      name: 'Pub. Time',
      field: 'publishDate',
      formatter: formatters.time
    });
    cols.push({
      id: 'price',
      name: 'Price',
      field: 'price',
      formatter: formatters.decimal,
      formatOptions: { locale: 'en-US' } // Data Values are in en-US
    });
    cols.push({
      id: 'bookCurrency',
      name: 'Currency',
      field: 'bookCurrency',
      formatter: formatters.text
    });
    cols.push({
      id: 'transactionCurrency',
      name: 'Transaction Currency',
      field: 'transactionCurrency',
      formatter: formatters.text,
    });
    cols.push({
      id: 'integer',
      name: 'Price (Int)',
      field: 'price',
      formatter: formatters.integer,
      formatOptions: { locale: 'en-US' } // Data Values are in en-US
    });
    cols.push({
      id: 'location',
      name: 'Location',
      field: 'location',
      formatter: formatters.hyperlink,
      href: '#'
    });
    cols.push({
      id: 'postHistory',
      name: 'Post History',
      field: 'postHistory',
      formatter: formatters.text
    });
    cols.push({
      id: 'active',
      name: 'Active',
      field: 'active',
      formatter: formatters.text
    });
    cols.push({
      id: 'convention',
      name: 'Convention',
      field: 'convention',
      formatter: formatters.text
    });
    cols.push({
      id: 'methodSwitch',
      name: 'Method Switch',
      field: 'methodSwitch',
      formatter: formatters.text,
      filterType: 'select'
    });
    cols.push({
      id: 'trackDeprecationHistory',
      name: 'Track Deprecation History',
      field: 'trackDeprecationHistory',
      formatter: formatters.dropdown
    });
    cols.push({
      id: 'useForEmployee',
      name: 'Use For Employee',
      field: 'useForEmployee',
      formatter: formatters.password
    });
    cols.push({
      id: 'deprecationHistory',
      name: 'Deprecation History',
      field: 'deprecationHistory',
      formatter: formatters.text
    });
    return cols;
  };

  beforeEach(async () => {
    // Mock the CSSStyleSheet in adoptedStyleSheets
    (window as any).CSSStyleSheet = function CSSStyleSheet() { //eslint-disable-line
      return { cssRules: [], replaceSync: () => '', insertRule: () => '' };
    };
    (window.StyleSheet as any).insertRule = () => '';

    container = new IdsContainer();
    dataGrid = new IdsDataGrid();
    dataGrid.shadowRoot.styleSheets = [window.StyleSheet];
    container.appendChild(dataGrid);
    document.body.appendChild(container);
    dataGrid.columns = columns();
    dataGrid.data = dataset;
  });

  afterEach(async () => {
    document.body.innerHTML = '';
  });

  describe('Setup / General Tests', () => {
    it('renders with no errors', () => {
      const errors = jest.spyOn(global.console, 'error');
      const dataGrid2: any = new IdsDataGrid();
      document.body.appendChild(dataGrid2);
      dataGrid2.columns = columns();
      dataGrid2.data = dataset;
      dataGrid2.remove();

      expect(document.querySelectorAll('ids-data-grid').length).toEqual(1);
      expect(errors).not.toHaveBeenCalled();
    });

    it('can set the label setting', () => {
      dataGrid.label = 'Books';
      expect(dataGrid.shadowRoot.querySelector('.ids-data-grid').getAttribute('aria-label')).toEqual('Books');
      expect(dataGrid.getAttribute('label')).toEqual('Books');

      dataGrid.label = null;
      expect(dataGrid.shadowRoot.querySelector('.ids-data-grid').getAttribute('aria-label')).toEqual('Data Grid');
      expect(dataGrid.getAttribute('label')).toEqual(null);
    });

    it('renders column css with adoptedStyleSheets', () => {
      document.body.innerHTML = '';
      dataGrid = new IdsDataGrid();
      dataGrid.shadowRoot.adoptedStyleSheets = () => [window.CSSStyleSheet];
      document.body.appendChild(dataGrid);
      dataGrid.columns = columns();
      dataGrid.data = dataset;

      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-header-cell').length).toEqual(dataGrid.columns.length);
    });

    it('renders column css with styleSheets', () => {
      document.body.innerHTML = '';
      dataGrid = new IdsDataGrid();
      dataGrid.shadowRoot.styleSheets = [window.StyleSheet];
      document.body.appendChild(dataGrid);
      dataGrid.columns = columns();
      dataGrid.data = dataset;

      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-header-cell').length).toEqual(dataGrid.columns.length);
    });

    it('skips render column no styleSheets in headless browsers', () => {
      document.body.innerHTML = '';
      dataGrid = new IdsDataGrid();
      dataGrid.shadowRoot.styleSheets = [];
      document.body.appendChild(dataGrid);
      dataGrid.columns = columns();
      dataGrid.data = dataset;

      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-header-cell').length).toEqual(dataGrid.columns.length);
    });

    it('renders one single column', () => {
      document.body.innerHTML = '';
      dataGrid = new IdsDataGrid();
      dataGrid.shadowRoot.styleSheets = [window.StyleSheet];
      document.body.appendChild(dataGrid);
      dataGrid.columns = [{
        id: 'test',
        width: 20
      }];
      dataGrid.data = dataset;

      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-header-cell').length).toEqual(dataGrid.columns.length);
    });
  });

  describe('Row Rendering Tests', () => {
    it('renders row data', () => {
      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-row').length).toEqual(10);
      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-cell').length).toEqual(dataGrid.columns.length * 9);
    });

    it('renders with no errors on empty data and columns', () => {
      const errors = jest.spyOn(global.console, 'error');

      document.body.innerHTML = '';
      dataGrid = new IdsDataGrid();
      document.body.appendChild(dataGrid);
      dataGrid.columns = [];
      dataGrid.data = [];
      dataGrid.template();

      expect(errors).not.toHaveBeenCalled();
    });

    it('renders with alternateRowShading option', () => {
      document.body.innerHTML = '';
      dataGrid = new IdsDataGrid();
      dataGrid.alternateRowShading = true;
      document.body.appendChild(dataGrid);
      dataGrid.columns = columns();
      dataGrid.data = dataset;

      expect(dataGrid.shadowRoot.querySelectorAll('.alt-row-shading').length).toEqual(1);
      expect(dataGrid.getAttribute('alternate-row-shading')).toEqual('true');
    });

    it('can reset the alternateRowShading option', () => {
      document.body.innerHTML = '';
      dataGrid = new IdsDataGrid();
      dataGrid.alternateRowShading = true;
      document.body.appendChild(dataGrid);
      dataGrid.columns = columns();
      dataGrid.data = dataset;
      dataGrid.alternateRowShading = false;
      dataGrid.alternateRowShading = true;
      dataGrid.alternateRowShading = null;
      dataGrid.alternateRowShading = true;
      dataGrid.alternateRowShading = 'false';

      expect(dataGrid.shadowRoot.querySelectorAll('.alt-row-shading').length).toEqual(0);
      expect(dataGrid.getAttribute('alternate-row-shading')).toEqual('false');
    });
  });

  describe('Virtual Scrolling Tests', () => {
    it('renders with virtualScroll option', () => {
      document.body.innerHTML = '';
      dataGrid = new IdsDataGrid();
      dataGrid.virtualScroll = true;
      document.body.appendChild(dataGrid);
      dataGrid.columns = columns();
      dataGrid.data = dataset;
      dataGrid.virtualScroll = false;

      expect(dataGrid.shadowRoot.querySelectorAll('ids-virtual-scroll').length).toEqual(0);
      expect(dataGrid.getAttribute('virtual-scroll')).toEqual(null);
    });

    it('can reset the virtualScroll option', () => {
      document.body.innerHTML = '';
      dataGrid = new IdsDataGrid();
      dataGrid.virtualScroll = true;
      document.body.appendChild(dataGrid);
      dataGrid.columns = columns();
      dataGrid.data = dataset;

      expect(dataGrid.shadowRoot.querySelectorAll('ids-virtual-scroll').length).toEqual(1);
    });

    it('has the right row height for each rowHeight value', () => {
      dataGrid.virtualScroll = true;
      expect(dataGrid.rowPixelHeight).toEqual(50);

      dataGrid.rowHeight = 'md';
      expect(dataGrid.rowPixelHeight).toEqual(40);

      dataGrid.rowHeight = 'sm';
      expect(dataGrid.rowPixelHeight).toEqual(35);

      dataGrid.rowHeight = 'xs';
      expect(dataGrid.rowPixelHeight).toEqual(30);
    });
  });

  describe('Column Rendering Tests', () => {
    it('renders single column with empty data', () => {
      document.body.innerHTML = '';
      dataGrid = new IdsDataGrid();
      document.body.appendChild(dataGrid);
      dataGrid.data = null;
      dataGrid.columns = columns();

      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-body').length).toEqual(1);
    });

    it('renders column when set to empty', () => {
      document.body.innerHTML = '';
      dataGrid = new IdsDataGrid();
      document.body.appendChild(dataGrid);
      dataGrid.columns = columns();
      dataGrid.data = dataset;
      dataGrid.columns = null;

      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-header-cell').length).toEqual(1);
    });

    it('renders column with no all set widths', () => {
      document.body.innerHTML = '';
      dataGrid = new IdsDataGrid();
      dataGrid.shadowRoot.adoptedStyleSheets = () => [window.CSSStyleSheet];
      document.body.appendChild(dataGrid);
      dataGrid.data = dataset;
      dataGrid.columns = columns().slice(0, 2);

      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-header-cell').length).toEqual(2);
    });

    it('supports hidden columns', () => {
      dataGrid.columns = [{
        id: 'price',
        name: 'Price',
        field: 'price',
        hidden: true
      },
      {
        id: 'bookCurrency',
        name: 'Currency',
        field: 'bookCurrency'
      },
      {
        id: 'transactionCurrency',
        name: 'Transaction Currency',
        field: 'transactionCurrency'
      }];

      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-header-cell').length).toEqual(2);
      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-cell').length).toEqual(18);

      dataGrid.columns = [{
        id: 'price',
        name: 'Price',
        field: 'price',
        hidden: true
      },
      {
        id: 'bookCurrency',
        name: 'Currency',
        field: 'bookCurrency'
      },
      {
        id: 'transactionCurrency',
        name: 'Transaction Currency',
        field: 'transactionCurrency',
        hidden: true
      }];

      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-header-cell').length).toEqual(1);
      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-cell').length).toEqual(9);
    });
  });

  describe('Sorting Tests', () => {
    it('fires sorted event on sort', () => {
      const mockCallback = jest.fn((x) => {
        expect(x.detail.elem).toBeTruthy();
        expect(x.detail.sortColumn.id).toEqual('description');
        expect(x.detail.sortColumn.ascending).toEqual(true);
      });

      dataGrid.addEventListener('sort', mockCallback);
      dataGrid.setSortColumn('description', true);

      expect(mockCallback.mock.calls.length).toBe(1);
    });

    it('fires sorted event on sort', () => {
      const mockCallback = jest.fn((x) => {
        expect(x.detail.elem).toBeTruthy();
        expect(x.detail.sortColumn.id).toEqual('description');
        expect(x.detail.sortColumn.ascending).toEqual(false);
      });

      dataGrid.addEventListener('sort', mockCallback);
      dataGrid.setSortColumn('description', false);

      expect(mockCallback.mock.calls.length).toBe(1);
    });

    it('fires defaults to ascending sort', () => {
      const mockCallback = jest.fn((x) => {
        expect(x.detail.elem).toBeTruthy();
        expect(x.detail.sortColumn.id).toEqual('description');
        expect(x.detail.sortColumn.ascending).toEqual(true);
      });

      dataGrid.addEventListener('sort', mockCallback);
      dataGrid.setSortColumn('description');

      expect(mockCallback.mock.calls.length).toBe(1);
    });

    it('sets sort state via the API', () => {
      dataGrid.setSortState('description');
      expect(dataGrid.shadowRoot.querySelectorAll('[data-column-id]')[2].getAttribute('aria-sort')).toBe('ascending');
    });

    it('handles wrong ID on sort', () => {
      const errors = jest.spyOn(global.console, 'error');
      dataGrid.setSortColumn('bookx', false);

      expect(errors).not.toHaveBeenCalled();
    });

    it('fires sorted event on click', () => {
      const mockCallback = jest.fn((x) => {
        expect(x.detail.elem).toBeTruthy();
        expect(x.detail.sortColumn.id).toEqual('description');
        expect(x.detail.sortColumn.ascending).toEqual(true);
      });

      dataGrid.addEventListener('sort', mockCallback);
      const headers = dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-header-cell');
      headers[2].querySelector('.ids-data-grid-header-cell-content-wrapper').click();

      expect(mockCallback.mock.calls.length).toBe(1);
    });

    it('should not error clicking on a non sortable column', () => {
      const errors = jest.spyOn(global.console, 'error');
      const mockCallback = jest.fn();

      dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-header-cell')[5].click();
      dataGrid.addEventListener('sort', mockCallback);

      expect(mockCallback.mock.calls.length).toBe(0);
      expect(errors).not.toHaveBeenCalled();
    });
  });

  describe('Container / Height Tests', () => {
    it('supports auto fit', () => {
      dataGrid.autoFit = true;
      expect(dataGrid.getAttribute('auto-fit')).toEqual('true');
      dataGrid.autoFit = false;
      expect(dataGrid.getAttribute('auto-fit')).toBeFalsy();
    });
  });

  describe('Row Height Tests', () => {
    it('can set the rowHeight setting', () => {
      dataGrid.rowHeight = 'xs';
      expect(dataGrid.shadowRoot.querySelector('.ids-data-grid').getAttribute('data-row-height')).toEqual('xs');
      expect(dataGrid.getAttribute('row-height')).toEqual('xs');

      dataGrid.rowHeight = 'sm';
      expect(dataGrid.shadowRoot.querySelector('.ids-data-grid').getAttribute('data-row-height')).toEqual('sm');
      expect(dataGrid.getAttribute('row-height')).toEqual('sm');

      dataGrid.rowHeight = 'md';
      expect(dataGrid.shadowRoot.querySelector('.ids-data-grid').getAttribute('data-row-height')).toEqual('md');
      expect(dataGrid.getAttribute('row-height')).toEqual('md');

      dataGrid.rowHeight = null;
      expect(dataGrid.shadowRoot.querySelector('.ids-data-grid').getAttribute('data-row-height')).toEqual('lg');
      expect(dataGrid.getAttribute('row-height')).toEqual(null);

      dataGrid.rowHeight = 'lg';
      expect(dataGrid.shadowRoot.querySelector('.ids-data-grid').getAttribute('data-row-height')).toEqual('lg');
      expect(dataGrid.getAttribute('row-height')).toEqual('lg');
    });

    it('can set the rowHeight setting in virtualScroll mode', () => {
      requestAnimationFrame(() => {
        dataGrid.virtualScroll = true;
        dataGrid.rowHeight = 'xs';
        expect(dataGrid.shadowRoot.querySelector('ids-virtual-scroll').getAttribute('item-height')).toEqual('30');

        dataGrid.rowHeight = 'sm';
        expect(dataGrid.shadowRoot.querySelector('ids-virtual-scroll').getAttribute('item-height')).toEqual('35');

        dataGrid.rowHeight = 'md';
        expect(dataGrid.shadowRoot.querySelector('ids-virtual-scroll').getAttribute('item-height')).toEqual('40');

        dataGrid.rowHeight = null;
        expect(dataGrid.shadowRoot.querySelector('ids-virtual-scroll').getAttribute('item-height')).toEqual('50');

        dataGrid.rowHeight = 'lg';
        expect(dataGrid.shadowRoot.querySelector('ids-virtual-scroll').getAttribute('item-height')).toEqual('50');

        dataGrid.virtualScroll = false;
        dataGrid.rowHeight = 'sm';
        expect(dataGrid.shadowRoot.querySelector('.ids-data-grid').getAttribute('data-row-height')).toEqual('sm');
        expect(dataGrid.getAttribute('row-height')).toEqual('sm');
      });
    });
  });

  describe('Formatter Tests', () => {
    it('can render with the text formatter', () => {
      // Renders undefined/null
      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-row')[1]
        .querySelectorAll('.ids-data-grid-cell')[3].querySelector('.text-ellipsis').innerHTML).toEqual('');

      // Renders text
      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-row')[2]
        .querySelectorAll('.ids-data-grid-cell')[3].querySelector('.text-ellipsis').innerHTML).toEqual('CORE');
    });

    it('can render with the password formatter', () => {
      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-row')[1]
        .querySelectorAll('.ids-data-grid-cell')[16].querySelector('.text-ellipsis').innerHTML).toEqual('**');

      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-row')[4]
        .querySelectorAll('.ids-data-grid-cell')[16].querySelector('.text-ellipsis').innerHTML).toEqual('**');
    });

    it('can render with the rowNumber formatter', () => {
      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-row')[1]
        .querySelectorAll('.ids-data-grid-cell')[1].querySelector('.text-ellipsis').innerHTML).toEqual('1');

      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-row')[4]
        .querySelectorAll('.ids-data-grid-cell')[1].querySelector('.text-ellipsis').innerHTML).toEqual('4');
    });

    it('can render with the date formatter', () => {
      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-row')[1]
        .querySelectorAll('.ids-data-grid-cell')[4].querySelector('.text-ellipsis').innerHTML).toEqual('4/23/2021');

      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-row')[4]
        .querySelectorAll('.ids-data-grid-cell')[4].querySelector('.text-ellipsis').innerHTML).toEqual('');
    });

    it('can render with the time formatter', () => {
      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-row')[1]
        .querySelectorAll('.ids-data-grid-cell')[5].querySelector('.text-ellipsis').innerHTML)
        .toEqual(new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(new Date('2021-04-23T18:25:43.511Z')));

      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-row')[4]
        .querySelectorAll('.ids-data-grid-cell')[5].querySelector('.text-ellipsis').innerHTML)
        .toEqual('');
    });

    it('can render with the decimal formatter', () => {
      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-row')[1]
        .querySelectorAll('.ids-data-grid-cell')[6].querySelector('.text-ellipsis').innerHTML).toEqual('12.99');

      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-row')[4]
        .querySelectorAll('.ids-data-grid-cell')[6].querySelector('.text-ellipsis').innerHTML).toEqual('');
    });

    it('can render with the decimal formatter (with defaults)', () => {
      delete dataGrid.columns[6].formatOptions;
      dataGrid.rerender();
      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-row')[1]
        .querySelectorAll('.ids-data-grid-cell')[6].querySelector('.text-ellipsis').innerHTML).toEqual('12.99');

      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-row')[4]
        .querySelectorAll('.ids-data-grid-cell')[6].querySelector('.text-ellipsis').innerHTML).toEqual('');
    });

    it('can render with the integer formatter', () => {
      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-row')[1]
        .querySelectorAll('.ids-data-grid-cell')[9].querySelector('.text-ellipsis').innerHTML).toEqual('13');

      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-row')[4]
        .querySelectorAll('.ids-data-grid-cell')[9].querySelector('.text-ellipsis').innerHTML).toEqual('');
    });

    it('can render with the integer formatter (with defaults)', () => {
      delete dataGrid.columns[9].formatOptions;
      dataGrid.rerender();
      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-row')[1]
        .querySelectorAll('.ids-data-grid-cell')[9].querySelector('.text-ellipsis').innerHTML).toEqual('13');

      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-row')[4]
        .querySelectorAll('.ids-data-grid-cell')[9].querySelector('.text-ellipsis').innerHTML).toEqual('');
    });

    it('can render with the hyperlink formatter', () => {
      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-row')[1]
        .querySelectorAll('.ids-data-grid-cell')[10].querySelector('ids-hyperlink').innerHTML).toEqual('United States');

      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-row')[6]
        .querySelectorAll('.ids-data-grid-cell')[10].querySelector('ids-hyperlink')).toBeFalsy();
    });

    it('can render with the hyperlink formatter (with default href)', () => {
      delete dataGrid.columns[10].href;
      dataGrid.rerender();
      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-row')[1]
        .querySelectorAll('.ids-data-grid-cell')[10].querySelector('ids-hyperlink').innerHTML).toEqual('United States');

      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-row')[6]
        .querySelectorAll('.ids-data-grid-cell')[10].querySelector('ids-hyperlink')).toBeFalsy();
    });

    it('can render with the hyperlink formatter (with href function)', () => {
      dataGrid.columns[10].href = (row: any) => {
        if (row.book === 101) {
          return null;
        }
        return `${row.book}`;
      };
      dataGrid.rerender();
      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-row')[2]
        .querySelectorAll('.ids-data-grid-cell')[10].querySelector('ids-hyperlink').getAttribute('href')).toEqual('102');

      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-row')[6]
        .querySelectorAll('.ids-data-grid-cell')[10].querySelector('ids-hyperlink')).toBeFalsy();
    });
  });

  describe('Keyboard Tests', () => {
    it('can handle ArrowRight key', () => {
      expect(dataGrid.activeCell.row).toEqual(0);
      expect(dataGrid.activeCell.cell).toEqual(0);

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      dataGrid.dispatchEvent(event);

      expect(dataGrid.activeCell.row).toEqual(0);
      expect(dataGrid.activeCell.cell).toEqual(1);
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.cell).toEqual(2);
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.cell).toEqual(3);
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.cell).toEqual(4);
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.cell).toEqual(5);
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.cell).toEqual(6);
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.cell).toEqual(7);
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.cell).toEqual(8);
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.cell).toEqual(9);
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.cell).toEqual(10);
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.cell).toEqual(11);
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.cell).toEqual(12);
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.cell).toEqual(13);
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.cell).toEqual(14);
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.cell).toEqual(15);
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.cell).toEqual(16);
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.cell).toEqual(17);
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.cell).toEqual(17);
    });

    it('can handle ArrowLeft key', () => {
      expect(dataGrid.activeCell.row).toEqual(0);
      expect(dataGrid.activeCell.cell).toEqual(0);

      let event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      dataGrid.dispatchEvent(event);

      expect(dataGrid.activeCell.row).toEqual(0);
      expect(dataGrid.activeCell.cell).toEqual(1);

      event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.cell).toEqual(0);
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.cell).toEqual(0);
    });

    it('can handle ArrowDown key', () => {
      expect(dataGrid.activeCell.row).toEqual(0);
      expect(dataGrid.activeCell.cell).toEqual(0);

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      dataGrid.dispatchEvent(event);

      expect(dataGrid.activeCell.row).toEqual(1);
      expect(dataGrid.activeCell.cell).toEqual(0);

      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.row).toEqual(2);
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.row).toEqual(3);
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.row).toEqual(4);
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.row).toEqual(5);
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.row).toEqual(6);
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.row).toEqual(7);
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.row).toEqual(8);
    });

    it('can handle ArrowUp key', () => {
      expect(dataGrid.activeCell.row).toEqual(0);

      let event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      dataGrid.dispatchEvent(event);

      expect(dataGrid.activeCell.row).toEqual(1);
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.row).toEqual(2);

      event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.row).toEqual(1);
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.row).toEqual(0);
      dataGrid.dispatchEvent(event);
      expect(dataGrid.activeCell.row).toEqual(0);
    });
  });

  describe('Active Cell Tests', () => {
    it('fires activecellchange event', () => {
      const mockCallback = jest.fn((x) => {
        expect(x.detail.elem).toBeTruthy();
        expect(x.detail.activeCell.row).toEqual(1);
        expect(x.detail.activeCell.cell).toEqual(0);
        expect(x.detail.activeCell.node).toBeTruthy();
      });

      dataGrid.addEventListener('activecellchange', mockCallback);
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      dataGrid.dispatchEvent(event);

      expect(mockCallback.mock.calls.length).toBe(1);
    });

    it('fires activecellchange event on click', () => {
      const mockCallback = jest.fn();

      dataGrid.addEventListener('activecellchange', mockCallback);
      dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-row')[3]
        .querySelectorAll('.ids-data-grid-cell')[3].click();

      expect(mockCallback.mock.calls.length).toBe(1);
      expect(dataGrid.activeCell.row).toEqual(2);
      expect(dataGrid.activeCell.cell).toEqual(3);
    });
  });

  describe('Theme/Style Tests', () => {
    it('supports setting mode', () => {
      dataGrid.mode = 'dark';
      expect(dataGrid.container.getAttribute('mode')).toEqual('dark');
    });

    it('supports setting version', () => {
      dataGrid.version = 'classic';
      expect(dataGrid.container.getAttribute('version')).toEqual('classic');
    });

    it('renders with listStyle option', () => {
      dataGrid.listStyle = true;
      expect(dataGrid.shadowRoot.querySelector('.ids-data-grid').classList.contains('is-list-style')).toBeTruthy();

      dataGrid.listStyle = false;
      expect(dataGrid.shadowRoot.querySelector('.ids-data-grid').classList.contains('is-list-style')).toBeFalsy();
    });

    it('renders with listStyle  from template', () => {
      dataGrid = createFromTemplate(dataGrid, `<ids-data-grid list-style="true"></ids-data-grid>`);
      dataGrid.columns = columns();
      dataGrid.data = dataset;
      expect(dataGrid.shadowRoot.querySelector('.ids-data-grid').classList.contains('is-list-style')).toBeTruthy();
    });
  });

  describe('RTL/Language Tests', () => {
    it('supports readonly columns / RTL', () => {
      expect(dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-row')[1]
        .querySelectorAll('.ids-data-grid-cell')[1].classList.contains('readonly')).toBeTruthy();
    });

    it('supports readonly RTL when set from the container', async () => {
      expect(dataGrid.shadowRoot.querySelector('.ids-data-grid-row:nth-child(2) .ids-data-grid-cell:nth-child(5)').textContent.trim()).toEqual('2/23/2021');
      expect(dataGrid.shadowRoot.querySelector('.ids-data-grid-row:nth-child(2) .ids-data-grid-cell:nth-child(6)').textContent.trim()).toEqual('1:25 PM');
      expect(dataGrid.shadowRoot.querySelector('.ids-data-grid-row:nth-child(2) .ids-data-grid-cell:nth-child(7)').textContent.trim()).toEqual('13.99');
      expect(dataGrid.shadowRoot.querySelector('.ids-data-grid-row:nth-child(2) .ids-data-grid-cell:nth-child(10)').textContent.trim()).toEqual('14');

      container.language = 'ar';
      await processAnimFrame();
      expect(dataGrid.getAttribute('dir')).toEqual('rtl');

      container.locale = 'de-DE';
      await processAnimFrame();
      expect(dataGrid.shadowRoot.querySelector('.ids-data-grid-row:nth-child(2) .ids-data-grid-cell:nth-child(5)').textContent.trim()).toEqual('23.2.2021');
      expect(dataGrid.shadowRoot.querySelector('.ids-data-grid-row:nth-child(2) .ids-data-grid-cell:nth-child(6)').textContent.trim()).toEqual('13:25');
      // Set to en-US for the example
      expect(dataGrid.shadowRoot.querySelector('.ids-data-grid-row:nth-child(2) .ids-data-grid-cell:nth-child(7)').textContent.trim()).toEqual('13.99');
      expect(dataGrid.shadowRoot.querySelector('.ids-data-grid-row:nth-child(2) .ids-data-grid-cell:nth-child(10)').textContent.trim()).toEqual('14');
    });
  });

  describe('Selection Tests', () => {
    it('renders a radio for single select', () => {
      const newColumns = deepClone(columns());
      newColumns[0].id = 'selectionRadio';
      newColumns[0].formatter = formatters.selectionRadio;
      dataGrid.rowSelection = 'single';
      dataGrid.columns = newColumns;

      expect(dataGrid.shadowRoot.querySelectorAll('.ids-datagrid-radio').length).toEqual(9);
    });

    it('removes rowSelection on setting to false', () => {
      dataGrid.rowSelection = 'single';
      expect(dataGrid.getAttribute('row-selection')).toEqual('single');
      dataGrid.rowSelection = false;
      expect(dataGrid.getAttribute('row-selection')).toBeFalsy();
    });

    it('keeps selections on sort for single and multiple selection', () => {
      const newColumns = deepClone(columns());
      newColumns[0].id = 'selectionRadio';
      newColumns[0].formatter = formatters.selectionRadio;
      dataGrid.rowSelection = 'single';
      dataGrid.columns = newColumns;

      expect(dataGrid.selectedRows.length).toBe(0);
      dataGrid.shadowRoot.querySelector('.ids-data-grid-body .ids-data-grid-row:nth-child(2) .ids-data-grid-cell:nth-child(1)').click();
      expect(dataGrid.selectedRows.length).toBe(1);
      expect(dataGrid.selectedRows[0].index).toBe(1);

      let headers = dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-header-cell');
      headers[2].querySelector('.ids-data-grid-header-cell-content-wrapper').click();

      expect(dataGrid.selectedRows.length).toBe(1);
      expect(dataGrid.selectedRows[0].index).toBe(1);

      headers = dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-header-cell');
      headers[2].querySelector('.ids-data-grid-header-cell-content-wrapper').click();
      expect(dataGrid.selectedRows.length).toBe(1);
      expect(dataGrid.selectedRows[0].index).toBe(7);
    });

    it('keeps selections on sort for mixed selection', () => {
      const newColumns = deepClone(columns());
      newColumns[0].id = 'selectionCheckbox';
      newColumns[0].formatter = formatters.selectionCheckbox;
      dataGrid.rowSelection = 'mixed';
      dataGrid.columns = newColumns;

      expect(dataGrid.selectedRows.length).toBe(0);
      dataGrid.shadowRoot.querySelector('.ids-data-grid-body .ids-data-grid-row:nth-child(2) .ids-data-grid-cell:nth-child(1)').click();
      dataGrid.shadowRoot.querySelector('.ids-data-grid-body .ids-data-grid-row:nth-child(3) .ids-data-grid-cell:nth-child(2)').click();
      expect(dataGrid.selectedRows.length).toBe(1);
      expect(dataGrid.activatedRow.index).toBe(2);
      expect(dataGrid.selectedRows[0].index).toBe(1);

      let headers = dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-header-cell');
      headers[2].querySelector('.ids-data-grid-header-cell-content-wrapper').click();
      expect(dataGrid.selectedRows.length).toBe(1);
      expect(dataGrid.activatedRow.index).toBe(2);
      expect(dataGrid.selectedRows[0].index).toBe(1);

      headers = dataGrid.shadowRoot.querySelectorAll('.ids-data-grid-header-cell');
      headers[2].querySelector('.ids-data-grid-header-cell-content-wrapper').click();
      expect(dataGrid.selectedRows.length).toBe(1);
      expect(dataGrid.selectedRows[0].index).toBe(7);
      expect(dataGrid.activatedRow.index).toBe(6);

      expect(dataGrid.shadowRoot.querySelector('.ids-data-grid-body .ids-data-grid-row.activated').getAttribute('aria-rowindex')).toBe('7');
    });

    it('can click the header checkbox to select all and deselect all', () => {
      const newColumns = deepClone(columns());
      newColumns[0].id = 'selectionCheckbox';
      newColumns[0].formatter = formatters.selectionCheckbox;
      dataGrid.rowSelection = 'multiple';
      dataGrid.columns = newColumns;

      dataGrid.headerCheckbox.click();
      expect(dataGrid.selectedRows.length).toBe(9);
      dataGrid.headerCheckbox.click();
      expect(dataGrid.selectedRows.length).toBe(0);
    });

    it('can select a row with space key', () => {
      const newColumns = deepClone(columns());
      newColumns[0].id = 'selectionCheckbox';
      newColumns[0].formatter = formatters.selectionCheckbox;
      dataGrid.rowSelection = 'multiple';
      dataGrid.columns = newColumns;

      dataGrid.activeCell.node.focus();

      const event = new KeyboardEvent('keydown', { key: ' ' });
      dataGrid.dispatchEvent(event);
      expect(dataGrid.selectedRows.length).toBe(1);
    });

    it('handles supress row deselection', () => {
      dataGrid.rowSelection = 'single';
      dataGrid.supressRowDeselection = false;
      dataGrid.shadowRoot.querySelector('.ids-data-grid-body .ids-data-grid-row:nth-child(2) .ids-data-grid-cell:nth-child(1)').click();
      expect(dataGrid.selectedRows.length).toBe(1);
      dataGrid.shadowRoot.querySelector('.ids-data-grid-body .ids-data-grid-row:nth-child(2) .ids-data-grid-cell:nth-child(1)').click();
      expect(dataGrid.selectedRows.length).toBe(0);

      dataGrid.supressRowDeselection = true;
      expect(dataGrid.supressRowDeselection).toBeTruthy();

      dataGrid.shadowRoot.querySelector('.ids-data-grid-body .ids-data-grid-row:nth-child(2) .ids-data-grid-cell:nth-child(1)').click();
      dataGrid.shadowRoot.querySelector('.ids-data-grid-body .ids-data-grid-row:nth-child(2) .ids-data-grid-cell:nth-child(1)').click();
      expect(dataGrid.selectedRows.length).toBe(1);
      expect(dataGrid.selectedRows[0].index).toBe(1);

      dataGrid.shadowRoot.querySelector('.ids-data-grid-body .ids-data-grid-row:nth-child(3) .ids-data-grid-cell:nth-child(1)').click();
      expect(dataGrid.selectedRows.length).toBe(1);
      expect(dataGrid.selectedRows[0].index).toBe(2);
    });

    it('handles a deSelectRow method', () => {
      dataGrid.rowSelection = 'mixed';
      dataGrid.selectRow(1);
      dataGrid.deSelectRow(1);
      expect(dataGrid.selectedRows.length).toBe(0);
      expect(dataGrid.rowByIndex(1).classList.contains('mixed')).toBeFalsy();
    });
  });

  describe('Activation Tests', () => {
    it('handles supress row deactivation', () => {
      dataGrid.rowSelection = 'mixed';
      dataGrid.supressRowDeactivation = false;
      dataGrid.shadowRoot.querySelector('.ids-data-grid-body .ids-data-grid-row:nth-child(2) .ids-data-grid-cell:nth-child(2)').click();
      expect(dataGrid.activatedRow.index).toBe(1);
      dataGrid.shadowRoot.querySelector('.ids-data-grid-body .ids-data-grid-row:nth-child(2) .ids-data-grid-cell:nth-child(2)').click();
      expect(dataGrid.activatedRow).toBeFalsy();

      dataGrid.supressRowDeactivation = true;
      expect(dataGrid.supressRowDeactivation).toBeTruthy();

      dataGrid.shadowRoot.querySelector('.ids-data-grid-body .ids-data-grid-row:nth-child(2) .ids-data-grid-cell:nth-child(2)').click();
      dataGrid.shadowRoot.querySelector('.ids-data-grid-body .ids-data-grid-row:nth-child(2) .ids-data-grid-cell:nth-child(2)').click();
      expect(dataGrid.activatedRow.index).toBe(1);

      dataGrid.shadowRoot.querySelector('.ids-data-grid-body .ids-data-grid-row:nth-child(3) .ids-data-grid-cell:nth-child(2)').click();
      expect(dataGrid.activatedRow.index).toBe(2);
    });

    it('should fire the rowactivated event', () => {
      const mockCallback = jest.fn((x) => {
        expect(x.detail.elem).toBeTruthy();
      });

      dataGrid.rowSelection = 'mixed';
      dataGrid.addEventListener('rowactivated', mockCallback);
      dataGrid.activateRow(1);

      expect(dataGrid.activatedRow.index).toBe(1);
      expect(mockCallback.mock.calls.length).toBe(1);

      dataGrid.rowSelection = false;
      dataGrid.activateRow(1);
      expect(dataGrid.activatedRow.index).toBe(1);
      expect(mockCallback.mock.calls.length).toBe(1);
    });

    it('handles a deActivateRow method', () => {
      dataGrid.deActivateRow(1);
      expect(dataGrid.activatedRow).toBeFalsy();

      dataGrid.rowSelection = 'mixed';
      dataGrid.activateRow(1);
      expect(dataGrid.activatedRow).toBeTruthy();
      dataGrid.deActivateRow(1);
      expect(dataGrid.activatedRow).toBeFalsy();
    });
  });

  describe('Paging Tests', () => {
    it('renders pager', () => {
      dataGrid.pagination = 'client-side';
      dataGrid.pageSize = 10;
      dataGrid.replaceWith(dataGrid);
      expect(dataGrid).toMatchSnapshot();
      expect(dataGrid.shadowRoot.innerHTML).toMatchSnapshot();
    });

    it('hides pager when pagination attribute is "none"', () => {
      dataGrid.pagination = 'client-side';
      expect(dataGrid.pagination).toBe('client-side');
      expect(dataGrid.shadowRoot.querySelector('ids-pager')).toBeDefined();

      dataGrid.pagination = 'none';
      expect(dataGrid.pagination).toBe('none');
      expect(dataGrid.shadowRoot.querySelector('ids-pager')).toBe(null);
    });

    it('shows pager when pagination attribute is "standalone"', () => {
      expect(dataGrid.pagination).toBe('none');
      expect(dataGrid.shadowRoot.querySelector('ids-pager')).toBe(null);

      dataGrid.pagination = 'standalone';
      expect(dataGrid.pagination).toBe('standalone');
      expect(dataGrid.shadowRoot.querySelector('ids-pager')).toBeDefined();
    });

    it('shows pager when pagination attribute is "client-side"', () => {
      expect(dataGrid.pagination).toBe('none');
      expect(dataGrid.shadowRoot.querySelector('ids-pager')).toBe(null);

      dataGrid.pagination = 'client-side';
      expect(dataGrid.pagination).toBe('client-side');
      expect(dataGrid.shadowRoot.querySelector('ids-pager')).toBeDefined();
    });

    it('shows pager when pagination attribute is "server-side"', () => {
      expect(dataGrid.pagination).toBe('none');
      expect(dataGrid.shadowRoot.querySelector('ids-pager')).toBe(null);

      dataGrid.pagination = 'server-side';
      expect(dataGrid.pagination).toBe('server-side');
      expect(dataGrid.shadowRoot.querySelector('ids-pager')).toBeDefined();
    });

    it('has page-total attribute', () => {
      dataGrid.pagination = 'client-side';
      expect(dataGrid.pageTotal).toBeDefined();
      expect(dataGrid.pageTotal).toBe(9);
    });

    it('has page-size attribute', () => {
      dataGrid.pagination = 'client-side';
      expect(dataGrid.pageSize).toBeDefined();
      expect(dataGrid.pageSize).toBe(1);

      dataGrid.pageSize = 25;
      expect(dataGrid.pageSize).toBe(25);

      dataGrid.pageSize = 0;
      expect(dataGrid.pageSize).toBe(1);
    });

    it('has page-number attribute', () => {
      dataGrid.pagination = 'client-side';
      expect(dataGrid.pageNumber).toBeDefined();
      expect(dataGrid.pageNumber).toBe(1);

      dataGrid.pageNumber = 2;
      expect(dataGrid.pageNumber).toBe(2);

      dataGrid.pageNumber = 0;
      expect(dataGrid.pageNumber).toBe(1);
    });

    it('always shows correct page-number in pager input-field', () => {
      dataGrid.pagination = 'client-side';
      dataGrid.replaceWith(dataGrid);

      expect(dataGrid.pageNumber).toBe(1);
      expect(dataGrid.pager.querySelector('ids-pager-input').input.value).toBe('1');

      dataGrid.pageNumber = 3;

      dataGrid.replaceWith(dataGrid);
      expect(dataGrid.pageNumber).toBe(3);
      expect(dataGrid.pager.querySelector('ids-pager-input').input.value).toBe('3');
    });

    it('can paginate to next page', () => {
      dataGrid.pagination = 'client-side';
      dataGrid.pageSize = 2;
      dataGrid.replaceWith(dataGrid);

      const { buttons } = dataGrid.pager.elements;
      const mouseClick = new MouseEvent('click', { bubbles: true });

      expect(dataGrid.pageNumber).toBe(1);
      buttons.next.button.dispatchEvent(mouseClick);
      expect(dataGrid.pageNumber).toBe(2);
      buttons.next.button.dispatchEvent(mouseClick);
      expect(dataGrid.pageNumber).toBe(3);
    });

    it('can paginate to last page', () => {
      dataGrid.pagination = 'client-side';
      dataGrid.pageSize = 2;
      dataGrid.replaceWith(dataGrid);

      const { buttons } = dataGrid.pager.elements;
      const mouseClick = new MouseEvent('click', { bubbles: true });

      expect(dataGrid.pageNumber).toBe(1);
      buttons.next.button.dispatchEvent(mouseClick);
      expect(dataGrid.pageNumber).toBe(2);
      buttons.last.button.dispatchEvent(mouseClick);
      expect(dataGrid.pageNumber).toBe(5);
      buttons.last.button.dispatchEvent(mouseClick);
      expect(dataGrid.pageNumber).toBe(5);
    });

    it('can paginate to previous page', () => {
      dataGrid.pagination = 'client-side';
      dataGrid.pageSize = 2;
      dataGrid.replaceWith(dataGrid);

      const { buttons } = dataGrid.pager.elements;
      const mouseClick = new MouseEvent('click', { bubbles: true });

      buttons.last.button.dispatchEvent(mouseClick);
      expect(dataGrid.pageNumber).toBe(5);
      buttons.previous.button.dispatchEvent(mouseClick);
      expect(dataGrid.pageNumber).toBe(4);
      buttons.previous.button.dispatchEvent(mouseClick);
      expect(dataGrid.pageNumber).toBe(3);
    });

    it('can paginate to first page', () => {
      dataGrid.pagination = 'client-side';
      dataGrid.pageSize = 2;
      dataGrid.replaceWith(dataGrid);

      const { buttons } = dataGrid.pager.elements;
      const mouseClick = new MouseEvent('click', { bubbles: true });

      buttons.last.button.dispatchEvent(mouseClick);
      expect(dataGrid.pageNumber).toBe(5);
      buttons.previous.button.dispatchEvent(mouseClick);
      expect(dataGrid.pageNumber).toBe(4);
      buttons.first.button.dispatchEvent(mouseClick);
      expect(dataGrid.pageNumber).toBe(1);
    });

    it('only fires pager events when pagination is "standalone"', () => {
      dataGrid.pagination = 'standalone';
      dataGrid.pageSize = 2;
      dataGrid.pageNumber = 1;
      dataGrid.replaceWith(dataGrid);

      const { buttons } = dataGrid.pager.elements;
      const mouseClick = new MouseEvent('click', { bubbles: true });

      const pageNumberChangedListener = jest.fn();
      dataGrid.onEvent('pagenumberchange', dataGrid.pager, pageNumberChangedListener);

      expect(pageNumberChangedListener).toHaveBeenCalledTimes(0);

      // page numbers shouldn't change in standalone mode
      expect(dataGrid.pageNumber).toBe(1);
      buttons.next.button.dispatchEvent(mouseClick);
      expect(dataGrid.pageNumber).toBe(1);
      buttons.next.button.dispatchEvent(mouseClick);
      expect(dataGrid.pageNumber).toBe(1);

      expect(pageNumberChangedListener).toHaveBeenCalledTimes(2);
    });

    it('shows page-size popup-menu in the end-slot', () => {
      dataGrid.pagination = 'client-side';
      dataGrid.pageNumber = 1;
      dataGrid.pageSize = 3;
      dataGrid.replaceWith(dataGrid);

      const { slots } = dataGrid.pager.elements;
      expect(slots.start).toBeDefined();
      expect(slots.middle).toBeDefined();
      expect(slots.end).toBeDefined();

      const endSlotNodes = slots.end.assignedNodes();

      expect(endSlotNodes[0].querySelector('ids-menu-button')).toBeDefined();
      expect(endSlotNodes[0].querySelector('ids-popup-menu')).toBeDefined();
    });

    it('page-size popup-menu has options for: 10, 25, 50, 100', () => {
      dataGrid.pagination = 'client-side';
      dataGrid.pageNumber = 1;
      dataGrid.pageSize = 3;
      dataGrid.replaceWith(dataGrid);

      const popupMenu = dataGrid.pager.querySelector('ids-popup-menu');
      const select10 = popupMenu.querySelector('ids-menu-item[value="10"]');
      const select25 = popupMenu.querySelector('ids-menu-item[value="25"]');
      const select50 = popupMenu.querySelector('ids-menu-item[value="50"]');
      const select100 = popupMenu.querySelector('ids-menu-item[value="100"]');

      expect(select10).toBeDefined();
      expect(select25).toBeDefined();
      expect(select50).toBeDefined();
      expect(select100).toBeDefined();

      const mouseClick = new MouseEvent('click', { bubbles: true });
      const menuButton = dataGrid.pager.querySelector('ids-menu-button');

      select10.dispatchEvent(mouseClick);
      expect(menuButton.textContent).toContain('10 Records per page');

      select25.dispatchEvent(mouseClick);
      expect(menuButton.textContent).toContain('25 Records per page');

      select50.dispatchEvent(mouseClick);
      expect(menuButton.textContent).toContain('50 Records per page');

      select100.dispatchEvent(mouseClick);
      expect(menuButton.textContent).toContain('100 Records per page');
    });
  });
});
