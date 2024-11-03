import fetchJson from './utils/fetch-json.js';
import SortableTableV2 from './../../06-events-practice/1-sortable-table-v2/index.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable extends SortableTableV2 {
  static step = 30;

  constructor(
    headersConfig, { 
      data = [],
      url,
      isSortLocally,
      sorted: { id, order } = {},
      isExtending = true,
    } = {}) {
    super(headersConfig, { data, sorted: { id, order }, isExtending });

    this.start = 0;
    this.end = SortableTable.step;
    this.url = url || '';
    this.isSortLocally = isSortLocally || false;
    this.id = id || headersConfig.find(item => item.sortable).id;
    this.order = order || 'asc';
    this.isDataEnd = false;
    this.scrollTimeout = null;

    this.handleWindowScroll = this.handleWindowScroll.bind(this);
    this.createEventListeners();
  }

  sortOnClient (id, order) {
    super.sort(id, order);
  }

  sortOnServer (id, order) {
    this.id = id;
    this.order = order;

    this.render();
  }

  async render() {
    await super.render();
    this.showLoading(true);

    if (!this.isSortLocally) {
      const data = await this.loadData();

      if (data.length === 0) {
        this.showEmptyPlaceholder();

        return;
      }

      this.updateTable(data);
    }
    this.showLoading(false);
  }

  updateTable(data) {
    if (data) {
      this.data = data;
    }
    
    const newBody = this.renderBody(this.data);
    this.subElements.body.innerHTML = '';
    this.subElements.body.append(...newBody.children);
  }

  async loadData() {
    const url = new URL(BACKEND_URL);

    url.pathname = this.url;
    url.searchParams.set('_sort', this.id);
    url.searchParams.set('_order', this.order);
    url.searchParams.set('_start', this.start);
    url.searchParams.set('_end', this.end);
  
    try {
      return await fetchJson(url);
    } catch {
      return [];
    }
  }

  async addData() {
    if (this.isDataEnd) {
      return;
    }

    this.start = this.end;
    this.end += SortableTable.step;
    const newData = await this.loadData();

    if (newData.length === 0) {
      this.isDataEnd = true;
    } else {
      this.data.push(...newData);
      this.updateTable();
    }
  }

  createEventListeners() {
    super.createEventListeners();
    window.addEventListener('scroll', this.handleWindowScroll);
  }

  removeEventListener() {
    window.removeEventListener('scroll', this.handleWindowScroll);
  }

  handleWindowScroll() {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = setTimeout(() => {
      if (this.element.getBoundingClientRect().bottom < window.innerHeight) {
        this.addData();
      }
    }, 500);
  }

  showLoading(isLoading) {
    this.subElements.loading.style.display = isLoading ? 'block' : 'none';
  }

  showEmptyPlaceholder() {
    this.subElements.emptyPlaceholder.style.display = 'block';
  }

  destroy() {
    super.destroy();
    this.removeEventListener();

    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }
}