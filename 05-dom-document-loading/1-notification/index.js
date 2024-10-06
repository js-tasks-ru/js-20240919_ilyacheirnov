export default class NotificationMessage {
  static lastShownComponent;

  constructor(message, { duration, type} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.element = null;
    this.timerId = null;

    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.className = `notification ${this.type}`;
    wrapper.style.setProperty('--value', `${this.duration}ms`);

    const innerWrapper = document.createElement('div');
    innerWrapper.classList.add('inner-wrapper');

    const header = document.createElement('div');
    header.classList.add('notification-header');
    header.innerText = this.type;

    this.body = document.createElement('div');
    this.body.classList.add('notification-body');
    this.body.innerHTML = this.message;

    const timer = document.createElement('div');
    timer.classList.add('timer');

    innerWrapper.append(header, this.body);
    wrapper.append(innerWrapper, timer);

    this.element = wrapper;
  }

  show(targetElement = document.body) {
    if (NotificationMessage.lastShownComponent) {
      NotificationMessage.lastShownComponent.destroy();
    }
    NotificationMessage.lastShownComponent = this;

    targetElement.append(this.element);
    this.timerId = setTimeout(() => this.destroy(), this.duration);
  }

  remove() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  destroy() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.remove();
  }
}
