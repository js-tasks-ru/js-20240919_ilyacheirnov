export default class DoubleSlider {
  
  handlerThumbDown = (e) => {
    switch (e.target) {
    case this.leftThumbler:
      this.leftThumbler.classList.add('range-slider_dragging');
      this.activeThumb = 'left';
      break;

    case this.rightThumbler:
      this.rightThumbler.classList.add('range-slider_dragging');
      this.activeThumb = 'right';
      break;

    default:
      break;
    }

    document.addEventListener('pointermove', this.handlerThumbMove);
  }

  handlerThumbMove = (e) => {
    switch (this.activeThumb) {
    case 'left':
      this.from = Math.max(
        this.min, Math.min(
          this.calculateThumblers(e), this.to
        )
      );
      break;

    case 'right':
      this.to = Math.max(
        this.from, Math.min(
          this.calculateThumblers(e), this.max
        )
      );
      break;

    default:
      return;
    }
    
    this.updateStyles();
  } 
  
  calculateThumblers(e) {
    const sliderInner = this.element.querySelector('.range-slider__inner');
    const rect = sliderInner.getBoundingClientRect();

    return Math.round(
      ((e.clientX - sliderInner.offsetLeft) / rect.width
      ) * (this.max - this.min)
    ) + this.min;
  }

  updateStyles() {
    const sliderProgress = this.element.querySelector('.range-slider__progress');

    const fromDataElem = this.element.querySelector("[data-element=from]");
    const toDataElem = this.element.querySelector("[data-element=to]");

    const leftThumblerPosition = (this.from - this.min) / (this.max - this.min) * 100;
    const rightThumblerPosition = (this.max - this.to) / (this.max - this.min) * 100;

    this.leftThumbler.style = `left: ${leftThumblerPosition}%`;
    this.rightThumbler.style = `right: ${rightThumblerPosition}%`;

    sliderProgress.style = `
    left: ${leftThumblerPosition}%; 
    right: ${rightThumblerPosition}%
    `;

    fromDataElem.textContent = this.formatValue(`${this.from}`);
    toDataElem.textContent = this.formatValue(`${this.to}`);
  }

  handlerThumbUp = () => {
    this.toggleDispatchEvent();
    if (this.leftThumbler.classList.contains('range-slider_dragging')) {
      this.leftThumbler.classList.remove('range-slider_dragging');
    } else {
      this.rightThumbler.classList.remove('range-slider_dragging');
    }

    document.removeEventListener('pointermove', this.handlerThumbMove);
  }

  constructor(props = {}) {
    const {
      min = 100,
      max = 1000,
      formatValue = value => value,
      selected: {from = min, to = max} = {},
    } = props;

    this.min = min;
    this.max = max;

    this.formatValue = formatValue;

    this.from = from;
    this.to = to;

    this.element = null;

    this.activeThumb = null;
    this.leftThumbler = null;
    this.rightThumbler = null;
    
    this.render();
    this.initialize();
    this.updateStyles();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.createSliderTemplate();
    this.element = wrapper.firstElementChild; 
  }

  initialize() {
    this.leftThumbler = this.element.querySelector('.range-slider__thumb-left');
    this.rightThumbler = this.element.querySelector('.range-slider__thumb-right');

    this.createEventListeners();
  }

  createEventListeners() {
    document.addEventListener('pointerdown', this.handlerThumbDown);
    document.addEventListener('pointerup', this.handlerThumbUp);
  }

  removeEventListeners() {
    document.removeEventListener('pointerdown', this.handlerThumbDown);
    document.removeEventListener('pointermove', this.handlerThumbMove);
    document.removeEventListener('pointerup', this.handlerThumbUp);
  }

  createSliderTemplate() {
    return `
        <div class="range-slider">
            <span data-element="from">${this.formatValue(this.from)}</span>
            <div class="range-slider__inner">
                <span class="range-slider__progress"></span>
                <span class="range-slider__thumb-left"></span>
                <span class="range-slider__thumb-right"></span>
            </div>
            <span data-element="to">${this.formatValue(this.to)}</span>
        </div>
    `;
  }

  toggleDispatchEvent() {
    this.element.dispatchEvent(new CustomEvent("range-select", {
      detail: { from: this.from, to: this.to }
    }));
  }

  destroy() {
    this.removeEventListeners();
    this.element.remove();
  }
}