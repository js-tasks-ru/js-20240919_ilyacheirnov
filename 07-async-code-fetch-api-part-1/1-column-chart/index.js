import fetchJson from './utils/fetch-json.js';
import ColumnChartV1 from './../../04-oop-basic-intro-to-dom/1-column-chart/index.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart extends ColumnChartV1 {
  constructor({
    url = '',
    range = { },
    ...props
  } = {}) {
    super(props);

    this.url = url;
    this.range = range;

    this.update(this.range.from, this.range.to);
    this.subElements = this.getSubElements();
  }

  async update(from, to) {
    this.setNewRange(from, to);

    this.element.classList.add('column-chart_loading');
    const data = await this.loadData();

    const valueData = Object.values(data);

    // calls update method from parent class
    super.update(valueData);
    const totalValue = valueData.reduce((accValue, value) => accValue + value, 0);

    this.subElements.header.innerHTML = this.formatHeading(totalValue);
    this.subElements.body.innerHTML = super.createChartTemplate();

    this.element.classList.remove('column-chart_loading');
    
    return data;
  }

  async loadData() {
    const url = new URL(this.url, BACKEND_URL);
    url.searchParams.set('from', this.range.from);
    url.searchParams.set('to', this.range.to);

    return await fetchJson(url);
  }

  setNewRange(from, to) {
    this.range.from = from;
    this.range.to = to;
  }

  getSubElements() {
    return {
      header: this.element.querySelector(".column-chart__header"),
      body: this.element.querySelector(".column-chart__chart"),
    };
  }
}