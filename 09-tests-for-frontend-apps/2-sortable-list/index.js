export default class SortableList {
  constructor({ items }) {
    this.items = items;
    this.element = this.createElement();
    this.placeHolder = null;
    this.draggingElement = null;
    this.hoverElement = null;

    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);

    this.createEventListener();
  }

  createElement() {
    const element = document.createElement('ul');
    element.classList.add('sortable-list');

    element.append(...this.items.map(item => {
      item.classList.add('sortable-list__item');
      return item;
    }));

    return element;
  }

  createPlaceHolder() {
    const placeHolder = document.createElement('li');
    placeHolder.classList.add('sortable-list__item', 'sortable-list__placeholder');

    return placeHolder;
  }

  createEventListener() {
    document.addEventListener('pointerdown', this.handlePointerDown);
  }

  handlePointerDown(event) {
    const target = event.target;
    const grabHandleElement = target.closest('[data-grab-handle]');
    const deleteHandleElement = target.closest('[data-delete-handle]');

    if (grabHandleElement) {
      this.startDragging(event, grabHandleElement);
    } else if (deleteHandleElement) {
      this.deleteHandleElement(deleteHandleElement);
    }

    event.preventDefault();
  }

  handlePointerMove(event) {
    this.updateDraggingElementPosition(event);
    const hoverElement = this.findHoverElement(event);
    
    if (hoverElement && hoverElement !== this.hoverElement) {
      this.hoverElement = hoverElement;
      this.updateElementPosition();
    }
  }

  updateDraggingElementPosition(event) {
    const { clientX, clientY } = event;

    this.setElementStyle(this.draggingElement, {
      left: `${clientX}px`,
      top: `${clientY}px`,
    });
  }

  findHoverElement(event) {
    const { clientY } = event;

    return this.items.find(item => {
      if (item === this.draggingElement) {
        return false;
      }

      const { top, bottom } = item.getBoundingClientRect();
      return clientY > top && clientY < bottom;
    }) || null;
  }

  updateElementPosition() {
    const draggingIndex = this.items.indexOf(this.draggingElement);
    const hoverIndex = this.items.indexOf(this.hoverElement);
  
    if (draggingIndex < hoverIndex) {
      this.element.insertBefore(this.placeHolder, this.hoverElement.nextSibling);
    } else {
      this.element.insertBefore(this.placeHolder, this.hoverElement);
    }
  
    this.items = Array.from(this.element.children);
  }

  handlePointerUp() {
    this.placeHolder.replaceWith(this.draggingElement);
    this.resetElements();
    this.removeDocumentEventListeners();
  }

  startDragging(event, grabHandleElement) {
    this.draggingElement = grabHandleElement.closest('.sortable-list__item');
    this.placeHolder = this.createPlaceHolder();
    this.setupDragging(event);

    document.addEventListener('pointermove', this.handlePointerMove);
    document.addEventListener('pointerup', this.handlePointerUp);
  }

  setupDragging(event) {
    const { clientX, clientY } = event;
    const { left, top, width } = this.draggingElement.getBoundingClientRect();
    const shiftX = clientX - left;
    const shiftY = clientY - top;

    this.setElementStyle(this.draggingElement, {
      width: `${width}px`,
      transform: `translate(-${shiftX}px, -${shiftY}px)`,
      left: `${clientX}px`,
      top: `${clientY}px`,
    });

    this.draggingElement.classList.add('sortable-list__item_dragging');
    this.draggingElement.after(this.placeHolder);
  }

  setElementStyle(element, styles) {
    Object.entries(styles).forEach(([key, value]) => {
      element.style.setProperty(key, value);
    });
  }

  resetElements() {
    this.draggingElement.removeAttribute('style');
    this.draggingElement.classList.remove('sortable-list__item_dragging');
    this.placeHolder = null;
    this.draggingElement = null;
    this.hoverElement = null;
  }

  removeDocumentEventListeners() {
    document.removeEventListener('pointermove', this.handlePointerMove);
    document.removeEventListener('pointerup', this.handlePointerUp);
  }

  removeEventListener() {
    document.removeEventListener('pointerdown', this.handlePointerDown);
  }

  deleteHandleElement(deleteHandleElement) {
    const element = deleteHandleElement.closest('.sortable-list__item');
    element.remove();
  }

  destroy() {
    this.removeEventListener();
    this.remove();
  }

  remove() {
    this.element.remove();
  }
}