import SortableList from './../2-sortable-list/index.js';
import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';
import ProductFormV1 from './../../08-forms-fetch-api-part-2/1-product-form-v1/index.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm extends ProductFormV1 {
  constructor (productId) {
    super(productId);
    this.productId = productId;
  }

  async render () {
    await super.render();
    const element = this.element;

    const imageListContainer = element.querySelector('[data-element="imageListContainer"]');
    const photoList = imageListContainer.firstElementChild.children;

    this.sortableList = new SortableList({ items: Array.from(photoList) });
    imageListContainer.firstElementChild.replaceWith(this.sortableList.element);

    return element;
  }
}
