class Tooltip {
  static instance;
  static elementOffset = { x: 10, y: 10 };

  handlePointOver = event => {
    const element = event.target.closest('[data-tooltip]');

    if (!element) {
      return;
    }

    this.render(element.dataset.tooltip);

    document.addEventListener('pointermove', this.handlePointMove);
  }

  handlePoinOut = () => {
    this.remove();
  }

  handlePointMove = event => {
    this.element.style.left = `${event.clientX + Tooltip.elementOffset.x}px`;
    this.element.style.top = `${event.clientY + Tooltip.elementOffset.y}px`;
  }

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;

    this.element = null;
  }

  initialize () {
    document.addEventListener('pointerover', this.handlePointOver);
    document.addEventListener('pointerout', this.handlePoinOut);
  }

  render(msg) {
    this.element = this.createTooltipTemplate(msg);
    document.body.append(this.element);
  }

  createTooltipTemplate(msg) {
    const elem = document.createElement('div');
    elem.className = 'tooltip';
    elem.innerHTML = msg;

    return elem;
  }

  remove() {
    this.element.remove();
  }
  destroy() { 
    document.removeEventListener('pointerover', this.handlePointOver);
    document.removeEventListener('pointerout', this.handlePoinOut);
    document.removeEventListener('pointermove', this.handlePointMove);
    this.remove();
  }
}

export default Tooltip;