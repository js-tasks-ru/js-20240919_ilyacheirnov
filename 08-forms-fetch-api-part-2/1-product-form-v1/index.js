import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  constructor (productId) {
    this.productId = productId;

    this.element = null;
    this.categories = null;
    this.subElements = null;
    this.editProduct = false;

    this.formData = {
      title: '',
      description: '',
      quantity: 1,
      subcategory: '',
      status: 1,
      price: 100,
      discount: 0,
    };
    this.productImages = [];
    
    this.onFormSubmit = this.onFormSubmit.bind(this);
  }

  async render () {
    await this.loadCategories();
    await this.loadProduct();

    this.element = document.createElement('div');
    this.element.classList.add('product-form');
    this.element.innerHTML = this.createFormTemplate();

    this.subElements = this.getSubElements();

    this.setFormValues();
    this.createEventListener();
    
    return this.element;
  }

  async loadCategories () {
    this.categories = await fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
  }

  async loadProduct () {
    if (!this.productId) {
      return;
    }

    const productData = await fetchJson(`${BACKEND_URL}/api/rest/products?id=${this.productId}`);
    if (productData && productData.length > 0) {
      const product = productData[0];
      this.productImages = product.images || [];
      this.editProduct = true;

      this.formData = this.setFormData(product);
    }
  }

  setFormData(source, getValue = (obj, key) => obj[key]) {
    const objFields = Object.keys(this.formData);

    return objFields.reduce((acc, key) => {
      const value = getValue(source, key);
      acc[key] = typeof this.formData[key] === 'number' ? Number(value) : value;

      return acc;
    }, {});
  }

  getSubElements() {
    const sublements = this.element.querySelectorAll('[data-element]');
  
    return [...sublements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  setFormValues() {
    const { productForm } = this.subElements;

    Object.entries(this.formData).forEach(([key, value]) => {
      const input = productForm.querySelector(`#${key}`);
      if (input) {
        input.value = value;
      }
    });
  }

  async onFormSubmit(event) {
    event.preventDefault();
    
    const valuesFromFormElements = this.subElements.productForm.elements || {};

    this.formData = this.setFormData(valuesFromFormElements, (obj, key) => obj[key].value);

    this.sendFormData();
    this.save();
  }

  save() {
    const event = this.editProduct ? 'product-updated' : 'product-saved';

    this.element.dispatchEvent(new CustomEvent(event, {
      detail: this.formData
    }));
  }

  async sendFormData() {
    const body = {
      ...this.formData,
      images: this.productImages
    };

    if (this.editProduct) {
      body.id = this.productId;
    }

    const method = this.editProduct ? 'PATCH' : 'PUT';

    return await fetchJson(`${BACKEND_URL}/api/rest/products`, {
      method: method,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body)
    });
  }

  createEventListener() {
    const { productForm } = this.subElements;
    productForm.addEventListener('submit', this.onFormSubmit);
  }

  removeEventListener() {
    const { productForm } = this.subElements;
    productForm.removeEventListener('submit', this.onFormSubmit);
  }

  createFormTemplate() {
    return `
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">${this.createTitleTemplate()}</div>
        <div class="form-group form-group__wide">${this.createDescriptionTemplate()}</div>
        <div class="form-group form-group__wide" data-element="sortable-list-container">${this.createPhotoTemplate()}</div>
        <div class="form-group form-group__half_left">${this.createCategoriesTemplate()}</div>
        <div class="form-group form-group__half_left form-group__two-col">${this.createPriceAndDiscountTemplate()}</div>
        <div class="form-group form-group__part-half">${this.createQuantityTemplate()}</div>
        <div class="form-group form-group__part-half">${this.createStatusTemplate()}</div>
        <div class="form-buttons">${this.createButtonSavetemplate()}</div>
      </form>
    `;
  }

  createTitleTemplate() {
    return `
      <fieldset>
        <label class="form-label">Название товара</label>
        <input required="" type="text" name="title" id="title" class="form-control" placeholder="Название товара">
      </fieldset>
    `;
  }

  createDescriptionTemplate() {
    return `
      <label class="form-label">Описание</label>
      <textarea required="" class="form-control" name="description" id="description" data-element="productDescription" placeholder="Описание товара"></textarea>
    `;
  }

  createPhotoTemplate() {
    const photoList = this.productImages.map(({source, url}) => `
    <li class="products-edit__imagelist-item sortable-list__item" style="">
      <input type="hidden" name="url" value="${url}">
      <input type="hidden" name="source" value="${source}">
      <span>
        <img src="icon-grab.svg" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="${source}" src="${url}">
        <span>${source}</span>
      </span>
      <button type="button">
        <img src="icon-trash.svg" data-delete-handle="${source}" alt="delete">
      </button>
    </li>
  `).join('');

    return `
      <label class="form-label">Фото</label>
      <div data-element="imageListContainer">
        <ul class="sortable-list">${photoList}</ul>
      </div>
      <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
    `;
  }

  createCategoriesTemplate() {
    const options = this.categories.flatMap(category =>{
      return category.subcategories.map(subcategory => {
        return `<option value="${subcategory.id}">${category.title} ${escapeHtml('>')} ${subcategory.title}</option>`;
      });
    }).join('');

    return `
      <label class="form-label">Категория</label>
      <select class="form-control" name="subcategory" id="subcategory">${options}</select>
    `;
  }

  createPriceAndDiscountTemplate() {
    return `
      <fieldset>
        <label class="form-label">Цена ($)</label>
        <input required="" type="number" name="price" id="price" class="form-control" placeholder="100">
      </fieldset>
      <fieldset>
        <label class="form-label">Скидка ($)</label>
        <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0">
      </fieldset>
    `;
  }

  createQuantityTemplate() {
    return `
      <label class="form-label">Количество</label>
      <input required="" type="number" class="form-control" name="quantity" id="quantity" placeholder="1">
    `;
  }

  createStatusTemplate() {
    const statusCheck = this.formData.status === 0 ? 
      `<option value="${this.formData.status}">Неактивен</option>
      <option value="">Активен</option>` :
      `<option value="${this.formData.status}">Активен</option>
      <option value="">Неактивен</option>`;

    return `
      <label class="form-label">Статус</label>
      <select class="form-control" name="status" id="status">${statusCheck}</select>
    `;
  }

  createButtonSavetemplate() {
    return `
      <button type="submit" name="save" class="button-primary-outline">
        Сохранить товар
      </button>
    `;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.removeEventListener();
  }
}