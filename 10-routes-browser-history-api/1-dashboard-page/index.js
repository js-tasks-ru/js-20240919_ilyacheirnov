import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  constructor() {
    const now = new Date();
    this.range = {
      from: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
      to: now
    };

    this.element = null;
    this.subElements = null;
    this.rangePicker = null;
    this.ordersChart = null;
    this.salesChart = null;
    this.costumersChart = null;
    this.sortableTable = null;

    this.initComponents();

    this.handleRangePickerChange = this.handleRangePickerChange.bind(this);
  }

  initComponents() {
    this.rangePicker = new RangePicker(this.range);

    this.ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: this.range,
      label: 'orders',
      link: '#'
    });

    this.salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: this.range,
      label: 'sales',
      formatHeading: data => `$${data}`
    });

    this.customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: this.range,
      label: 'customers',
    });

    this.initSortableTable();
  }

  initSortableTable() {
    this.sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?from=${this.range.from.toISOString()}&to=${this.range.to.toISOString()}`,
      isSortLocally: true,
    });
    this.sortableTable.element.dataset.element = 'sortableTable';
    this.sortableTable.element.classList.add('sortable-table');
  }

  async render() { 
    const element = document.createElement('div');
    element.classList.add('dashboard');

    this.createDashboard(element);

    return element;
  }

  createDashboard(element) { 
    const topPanel = this.createTopPanel();
    const columnChart = this.createCharts();
    const blockTitle = this.createBlockTitle();

    element.append(topPanel, columnChart, blockTitle, this.sortableTable.element);
    this.element = element;
   
    this.subElements = this.getSubElements();
    this.createEventListener();
  }

  createTopPanel() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('content__top-panel');

    const title = document.createElement('h2');
    title.classList.add('page-title');
    title.textContent = 'Dashboard';

    this.rangePicker.element.dataset.element = 'rangePicker';
    wrapper.append(title, this.rangePicker.element);

    return wrapper;
  }

  createCharts() {
    const wrapper = document.createElement('div');
    wrapper.dataset.element = 'chartsRoot';
    wrapper.classList.add('dashboard__charts');

    this.ordersChart.element.dataset.element = 'ordersChart';
    this.ordersChart.element.classList.add('dashboard__chart_orders');

    this.salesChart.element.dataset.element = 'salesChart';
    this.salesChart.element.classList.add('dashboard__chart_sales');

    this.customersChart.element.dataset.element = 'customersChart';
    this.customersChart.element.classList.add('dashboard__chart_customers');

    wrapper.append(this.ordersChart.element, this.salesChart.element, this.customersChart.element);

    return wrapper;
  }

  createBlockTitle() {
    const blockTitle = document.createElement('h3');
    blockTitle.classList.add('block-title');
    blockTitle.textContent = 'Best sellers';

    return blockTitle;
  }

  createEventListener() {
    this.subElements.rangePicker.addEventListener('date-select', this.handleRangePickerChange);
  }

  removeEventListener() {
    this.subElements.rangePicker.removeEventListener('date-select', this.handleRangePickerChange);
  }

  handleRangePickerChange(event) {
    const { from, to } = event.detail;

    if (from && to) {
      this.range = {
        from: from,
        to: to
      };
  
      this.updateDashboard();
    }
  }

  updateDashboard() {
    const { from, to } = this.range;

    this.ordersChart.loadData(from, to);
    this.salesChart.loadData(from, to);
    this.customersChart.loadData(from, to);

    this.initSortableTable();
    this.subElements.sortableTable.replaceWith(this.sortableTable.element);
    this.subElements.sortableTable = this.sortableTable.element;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
  
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  destroy() {
    this.removeEventListener();
    this.remove();
  }

  remove() {
    this.element.remove();
  }
}