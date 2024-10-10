import SortableTableBase from './../../05-dom-document-loading/2-sortable-table-v1/index.js';

export default class SortableTable extends SortableTableBase {
  static currentElement;

  constructor(headersConfig, {
    data = [],
    sorted = {}
  } = {}) {
    super(headersConfig, data);
    
    // init sort
    this.sort(sorted.id, sorted.order);

    this.createEventListeners();
    this.createArrow();
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

    const currentArrow = this.subElements.header.querySelector('.sortable-table__sort-arrow');
    if (currentArrow) {
      currentArrow.remove();
    }

    tdElement.dataset.order = this.sortedOrder;
    tdElement.innerHTML += this.createArrow();

    const sortField = tdElement.dataset.id;
    this.sort(sortField, this.sortedOrder);

    this.currentElement = tdElement;
    
  }

  createArrow() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
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