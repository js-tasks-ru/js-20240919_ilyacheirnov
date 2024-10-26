export default class RangePicker {
  constructor(props = {}) {
    const {
      from, to,
    } = props;

    this.month = [
      'январь',
      'февраль',
      'март',
      'апрель',
      'май',
      'июнь',
      'июль',
      'август',
      'сентябрь',
      'октябрь',
      'ноябрь',
      'декабрь',
    ];

    this.from = from || new Date();
    this.to = to || new Date(from.getFullYear(), from.getMonth() + 1);

    this.firstMonth = new Date(this.from.getFullYear(), this.from.getMonth());
    this.secondMonth = new Date(this.from.getFullYear(), this.from.getMonth() + 1);

    this.selectorOpen = false;
    this.isSelecting = false;
    this.subElements = null;

    this.toggleSelector = this.toggleSelector.bind(this);
    this.handleSelector = this.handleSelector.bind(this);
    this.handleOuterSelector = this.handleOuterSelector.bind(this);

    //
    this.firstMonthDay = from;
    this.secondMonthDay = new Date(this.from.getFullYear(), this.from.getMonth() + 1);

    this.init();
  }

  init() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.createTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();
    this.createEventListeners();
  }

  getSubElements() {
    const sublements = this.element.querySelectorAll('[data-element]');
      
    return [...sublements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  createTemplate() {
    return `
        <div class="rangepicker">
            <div class="rangepicker__input" data-element="input">${this.createInputTemplate()}</div>
            <div class="rangepicker__selector" data-element="selector"></div>
        </div>
    `;
  }

  createInputTemplate() {
    return `
      <span data-element="from">${this.getDate(this.from)}</span>-<span data-element="to">${this.getDate(this.to)}</span>
    `;
  }

  getDate(date) {
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  createSelectorTemplate(firstMonth, secondMonth) {
    return `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      ${this.createCalendarTemplate(firstMonth)}
      ${this.createCalendarTemplate(secondMonth)} 
    `;
  }

  createCalendarTemplate(date) {
    const monthName = this.month[date.getMonth()];

    return `
    <div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator">
          <time datetime="${monthName}">${monthName}</time>
        </div>
        <div class="rangepicker__day-of-week">
          <div>Пн</div>
          <div>Вт</div>
          <div>Ср</div>
          <div>Чт</div>
          <div>Пт</div>
          <div>Сб</div>
          <div>Вс</div>
        </div>
        <div class="rangepicker__date-grid">${this.createDayButtonsTemplate(date)}</div>
      </div>
    `;
  }

  createDayButtonsTemplate(date) {
    const dayButtons = [];
    const startDay = (date.getDay() + 6) % 7 + 1;
    const endMonthDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    
    for (let i = 1; i <= endMonthDay; i++) {
      const currentDate = new Date(date.getFullYear(), date.getMonth(), i); 
      const style = i === 1 ? `style="--start-from: ${startDay}"` : '';
      let className = 'rangepicker__cell';

      dayButtons.push(
        `<button type="button" class="${className}" data-value="${currentDate.toISOString()}" ${style}>${i}</button>`
      );
    }

    return dayButtons.join('');
  }

  createEventListeners() {
    this.subElements.input.addEventListener('click', this.toggleSelector);
    this.subElements.selector.addEventListener('click', this.handleSelector);
    document.addEventListener('click', this.handleOuterSelector);
  }
    
  toggleSelector() {
    this.element.classList.toggle('rangepicker_open');

    if (!this.selectorOpen) {
      this.selectorOpen = true;
      this.subElements.selector.innerHTML = this.createSelectorTemplate(this.firstMonth, this.secondMonth);
      this.updateSelection();
    } else {
      this.selectorOpen = false;
    }
  }

  handleSelector(event) {
    if (event.target.tagName === "BUTTON") {
      this.removeHighlightedDays();
      const selectedDate = new Date(event.target.dataset.value);

      if (!this.isSelecting) {
        this.from = selectedDate;
        this.isSelecting = true;
      } else {
        if (selectedDate < this.from) {
          this.to = this.from;
          this.from = selectedDate;
        } else {
          this.to = selectedDate;
        } 
        this.isSelecting = false;
        this.updateSelection();
      }
    }
  } 

  updateSelection() {
    this.subElements.from.textContent = this.getDate(this.from);
    this.subElements.to.textContent = this.getDate(this.to);
    this.highlightSelectedRange();
  }

  moveCalendar(direction) {
    const firstMonth = new Date(this.firstMonth.getFullYear(), this.firstMonth.getMonth() + direction, 1);
    const secondMonth = new Date(this.secondMonth.getFullYear(), this.secondMonth.getMonth() + direction, 1);
    const [firstCalendar, secondCalendar] = this.subElements.selector.querySelectorAll(".rangepicker__calendar");
    const wrapper = document.createElement("div");

    this.firstMonth = firstMonth;
    this.secondMonth = secondMonth;

    if (direction === -1) {
      secondCalendar.remove();
      wrapper.innerHTML = this.createCalendarTemplate(this.firstMonth);
      firstCalendar.before(wrapper.firstElementChild);
    } else {
      firstCalendar.remove();
      wrapper.innerHTML = this.createCalendarTemplate(this.secondMonth);
      secondCalendar.after(wrapper.firstElementChild);
    }

    this.updateSelection();
  }

  highlightSelectedRange() {
    const buttons = this.subElements.selector.querySelectorAll('.rangepicker__cell');

    buttons.forEach(button => {
      const date = new Date(button.dataset.value);

      if (date.getTime() === this.from.getTime()) {
        button.classList.add('rangepicker__selected-from');
      } else if (date.getTime() === this.to.getTime()) {
        button.classList.add('rangepicker__selected-to');
      } else if (date > this.from && date < this.to) {
        button.classList.add('rangepicker__selected-between');
      }
    });
  }

  handleOuterSelector(event) {
    const isClickedInside = event.target.closest('.rangepicker');
    const isArrowClicked = event.target.closest('.rangepicker__selector-control-left, .rangepicker__selector-control-right');
    
    if (!isClickedInside && this.selectorOpen) {
      this.toggleSelector();
    } else if (isArrowClicked) {
      if (event.target.closest('.rangepicker__selector-control-left')) {
        this.moveCalendar(-1);
      } else if (event.target.closest('.rangepicker__selector-control-right')) {
        this.moveCalendar(1);
      }
    }
  }

  removeHighlightedDays() {
    this.subElements.selector.querySelectorAll('.rangepicker__selected-from,.rangepicker__selected-to,.rangepicker__selected-between').forEach(element => {
      element.classList.remove('rangepicker__selected-from', 'rangepicker__selected-to', 'rangepicker__selected-between');
    });
  }

  removeEventListeners() {
    this.subElements.input.removeEventListener('click', this.toggleSelector);
    this.subElements.selector.removeEventListener('click', this.handleSelector);
    document.removeEventListener('click', this.handleOuterSelector);
  }

  destroy() {
    this.removeEventListeners();
    this.remove();
  }

  remove() {
    this.element.remove();
  }
}