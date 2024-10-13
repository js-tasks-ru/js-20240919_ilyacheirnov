export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.defaultSortField = 'title';
  
    this.render();
    this.subElements = this.getSubElements();
  }
  
  render() {
    const element = document.createElement('div');
    element.classList.add('sortable-table');
  
    const header = this.renderHeader();
    const body = this.renderBody(this.data);
  
    element.append(header, body);
    this.element = element;
  }
  
  renderHeader() {
    const headerRow = document.createElement('div');
    headerRow.classList.add('sortable-table__header', 'sortable-table__row');
    headerRow.dataset.element = 'header';
  
    this.headerConfig.forEach(header => {
      const headerCell = document.createElement('div');
      headerCell.classList.add('sortable-table__cell');
      headerCell.dataset.id = header.id;
      headerCell.dataset.sortable = header.sortable;
  
      headerCell.innerHTML = `<span>${header.title}</span>`;

      if (header.id === this.defaultSortField) {  
        headerCell.innerHTML += this.createArrowTemplate();
      }
  
      headerRow.append(headerCell);
    });
  
    return headerRow;
  }
  
  renderBody(data = this.data) {
    const body = document.createElement('div');
    body.classList.add('sortable-table__body');
    body.dataset.element = 'body';

    data.forEach(item => {
      const row = document.createElement('a');
      row.href = item.images && item.images[0] ? item.images[0].url : '#';
      row.classList.add('sortable-table__row');

      this.headerConfig.forEach(header => {
        if (header.template && typeof header.template === 'function') {
          row.innerHTML = header.template(item[header.id]);
        } else {
          const cell = document.createElement('div');
          cell.classList.add('sortable-table__cell');
          cell.textContent = item[header.id];
          row.append(cell);
        }
      });

      body.append(row);
    });

    return body;
  }
  
  sort(fieldValue, orderValue) {
    const sortOrder = orderValue === 'asc' ? 1 : -1;
  
    const sortedData = [...this.data].sort((a, b) => {
      const aValue = a[fieldValue];
      const bValue = b[fieldValue];
  
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder * (aValue - bValue);
      }
  
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder * aValue.localeCompare(bValue, 'ru', { sensitivity: 'base' });
      }
  
      return 0; 
    });
  
    this.data = sortedData;
  
    const body = this.subElements.body;
    body.innerHTML = '';
  
    const newBody = this.renderBody(sortedData);
    body.append(...newBody.children);
  }

  createArrowTemplate() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
  }
  
  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
  
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }
  
  destroy() {
    this.element.remove();
    this.subElements = {};
  } 
}

