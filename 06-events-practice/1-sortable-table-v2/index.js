import SortableTableV1 from './../../05-dom-document-loading/2-sortable-table-v1/index.js';

export default class SortableTable extends SortableTableV1 {
  static currentElement;

  constructor(headersConfig, {
    data = [],
    sorted = {}
  } = {}) {
    super(headersConfig, data);

    this.arrowElement = this.subElements.header.querySelector('.sortable-table__sort-arrow');

    this.createEventListeners();
  }

  createEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.headerHandler);
  }

  headerHandler = (e) => {
    const tdElement = e.target.closest('.sortable-table__cell');

    if (!tdElement || !tdElement.dataset.sortable) {
      return;
    }

    if (this.currentElement === tdElement) {
      // if sorted Order is 'asc', then rename it to 'desc', else 'asc'
      this.sortedOrder = this.sortedOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortedOrder = 'desc';
    }

    tdElement.dataset.order = this.sortedOrder;
    tdElement.appendChild(this.arrowElement);

    const sortField = tdElement.dataset.id;
    this.sort(sortField, this.sortedOrder);

    this.currentElement = tdElement;
    
  }

  destroyEventListeners() {
    if (this.subElements.header) {
      this.subElements.header.removeEventListener('pointerdown', this.headerHandler);
    }
  }

  destroy() {
    this.destroyEventListeners();
    super.destroy();
  }
}