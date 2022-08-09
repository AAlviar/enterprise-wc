import '../ids-data-grid';
import '../../ids-container/ids-container';
import productsJSON from '../../../assets/data/products.json';

// Example for populating the DataGrid
const dataGrid: any = document.querySelector('#data-grid-paging-server-side');
const container: any = document.querySelector('ids-container');

(async function init() {
  // Set Locale and wait for it to load
  await container.setLocale('en-US');
  const columns = [];

  // Set up columns
  columns.push({
    id: 'id',
    name: 'ID',
    field: 'id',
    formatter: dataGrid.formatters.text,
    width: 80,
    sortable: true
  });
  columns.push({
    id: 'color',
    name: 'Color',
    field: 'color',
    formatter: dataGrid.formatters.text,
    sortable: true
  });
  columns.push({
    id: 'inStock',
    name: 'In Stock',
    field: 'inStock',
    formatter: dataGrid.formatters.text,
    sortable: true
  });
  columns.push({
    id: 'productId',
    name: 'Product Id',
    field: 'productId',
    formatter: dataGrid.formatters.text,
    sortable: true
  });
  columns.push({
    id: 'productName',
    name: 'Product Name',
    field: 'productName',
    formatter: dataGrid.formatters.text,
    sortable: true
  });
  columns.push({
    id: 'unitPrice',
    name: 'Unit Price',
    field: 'unitPrice',
    formatter: dataGrid.formatters.text,
    sortable: true
  });
  columns.push({
    id: 'units',
    name: 'Units',
    field: 'units',
    formatter: dataGrid.formatters.text,
    sortable: true
  });

  // Do an ajax request
  const url: any = productsJSON;
  const response = await fetch(url);
  const data = await response.json();

  // Fake server side pagination
  const paginateData = (pageNumber = 1, pageSize = 10) => {
    const last = pageNumber * pageSize;
    const start = last - pageSize;
    dataGrid.data = data.slice(start, start + pageSize);
    dataGrid.pageTotal = data.length;
    dataGrid.pageNumber = pageNumber;
    dataGrid.pageSize = pageSize;
  };

  dataGrid.columns = columns;
  paginateData(1, dataGrid.pageSize);

  dataGrid.pager.addEventListener('pagenumberchange', async (e: CustomEvent) => {
    paginateData(e.detail.value, dataGrid.pageSize);
  });

  console.info('Loading Time:', window.performance.now());
  console.info('Page Memory:', (window.performance as any).memory);
}());
