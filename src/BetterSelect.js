/**
 * A Better Custom Select
 *
 * Developer: Bogdan Barbu (barbu.bogdan.beniamin@gmail.com)
 */
export default class BetterSelect {
  #element;
  #wrapperEl;
  #triggerEl;
  #triggerTitleEl;
  #dropdownEl;

  #skipEmpty;
  placeholder;
  #nativeOnMobile;
  #mobileBreakpoint;

  #wrapperClass;
  #triggerClass;
  #dropdownClass;

  #value;
  #title;
  #options;
  #opened = false;

  mobileMediaQuery = null;
  #isMobile = false;

  static zIndex = 100;
  #zIndex;
  #originalStyle;

  /**
   * create the custom select
   */
  constructor(
    element,
    {
      skipEmpty = true,
      placeholder = null,
      nativeOnMobile = true,
      mobileBreakpoint = 1024,
      wrapperClass = 'better-select',
      triggerClass = 'better-select__trigger',
      dropdownClass = 'better-select__dropdown',
      zIndex = null,
    } = {}
  ) {
    // make sure we have a select as an original element
    if (!element || !(element instanceof HTMLSelectElement)) {
      console.warn(
        '[BETTER SELECT] Wrong element given. Expected a select, received ',
        element
      );
      return;
    }

    if (element.dataset.betterSelectInit) {
      return;
    }

    this.#element = element;
    this.#element.dataset.betterSelectInit = true;
    this.#element.betterSelectInstance = this;
    this.#skipEmpty = skipEmpty;
    this.placeholder = placeholder;
    this.#zIndex = zIndex || this.constructor.zIndex--;

    this.#nativeOnMobile = nativeOnMobile;
    this.#mobileBreakpoint = mobileBreakpoint;
    this.#wrapperClass = wrapperClass;
    this.#triggerClass = triggerClass;
    this.#dropdownClass = dropdownClass;

    this.#initialize();
  }

  // dispatch custom events
  #triggerEvent(eventType, detail = {}, target = false) {
    const event = new CustomEvent(eventType, {
      bubbles: true,
      cancelable: true,
      instance: this,
      detail,
    });
    return !target
      ? this.#element.dispatchEvent(event)
      : target.dispatchEvent(event);
  }

  #initialize() {
    this.#getValues();
    this.#createUI();
    this.#addListeners();
  }

  /**
   * get the values from the original select
   */
  #getValues() {
    this.#value = this.#element.value;
    if (!this.#value && this.placeholder) {
      this.#title = this.placeholder;
    } else {
      const selectedOption = this.#element.options[this.#element.selectedIndex];
      this.#title = selectedOption?.text || this.placeholder;
    }
  }

  /**
   * create the UI elements
   */
  #createUI() {
    // create the trigger
    this.#triggerEl = document.createElement('a');
    this.#triggerEl.style.display = 'block';
    this.#triggerEl.href = '#';
    this.#triggerEl.className = this.#triggerClass;
    this.#triggerTitleEl = document.createElement('span');
    this.#triggerEl.append(this.#triggerTitleEl);

    // create the wrapper
    this.#wrapperEl = document.createElement('div');
    this.#wrapperEl.classList.add(this.#wrapperClass);
    this.#wrapperEl.style.zIndex = this.#zIndex;
    if (this.#element.name) {
      this.#wrapperEl.classList.add(
        `${this.#wrapperClass}-${this.#element.name}`
      );
    }
    this.#element.insertAdjacentElement('beforebegin', this.#wrapperEl);

    // add elements inside the wrapperEl
    this.#createDropdown();

    this.#wrapperEl.append(this.#element);
    this.#wrapperEl.append(this.#triggerEl);
    this.#wrapperEl.append(this.#dropdownEl);
    this.#wrapperEl.style.position = 'relative';
    this.#originalStyle = this.#element.style.cssText;
    window.requestAnimationFrame(() => {
      this.#element.style.cssText += `; opacity: 0; position: absolute; left: 0; right: 0; top: 0; height: ${
        this.#triggerEl.offsetHeight || 20
      }px;`;
    });

    if (this.#nativeOnMobile) {
      this.mobileMediaQuery = window.matchMedia(
        `(max-width: ${this.#mobileBreakpoint}px)`
      );
    }

    // initialize the UI values
    this.updateUI();
    window.requestAnimationFrame(() => this.#checkIfMobile());
  }

  /**
   * create the dropdownEl
   */
  #createDropdown() {
    const dropdownEl = document.createElement('div');
    dropdownEl.className = this.#dropdownClass;
    dropdownEl.style.width = this.#element.offsetWidth;

    this.#options = [...this.#element.options]
      .map(option => {
        const value = option.value;

        // disable and skip empty options
        if (this.#skipEmpty && !value.length) {
          option.disabled = true;
          return null;
        }

        // create the dropdownEl element
        const element = document.createElement('a');
        element.href = '#';
        element.dataset.value = option.value;
        element.innerText = option.text;
        if (option.disabled) {
          element.classList.add('is-disabled');
        }

        return {
          originalOption: option,
          value,
          element,
          disabled: option.disabled,
        };
      })
      .filter(Boolean);

    // create the list
    const list = document.createElement('ul');
    this.#options.forEach(({ element }) => {
      const item = document.createElement('li');
      item.append(element);
      list.append(item);
    });

    // add the list to the dropdownEl
    dropdownEl.append(list);
    dropdownEl.style = 'position: absolute; left: 0; top: 100%; right: 0;';
    if (this.#dropdownEl) {
      this.#dropdownEl.replaceWith(dropdownEl);
    }
    this.#dropdownEl = dropdownEl;
    return;
  }

  /**
   * update UI elements values
   */
  updateUI() {
    this.#getValues();
    this.#triggerTitleEl.innerHTML = this.#title;
    this.#triggerEl.classList.toggle('has-selected', !!this.#value);
    this.#options.forEach(item => {
      item.element.parentElement.classList.toggle(
        'is-active',
        item.originalOption.selected
      );
    });
  }

  /**
   * destroy the custom select and put back the original element
   */
  destroy() {
    this.#element.style.cssText = this.#originalStyle;
    delete this.#element.betterSelectInstance;
    delete this.#element.dataset.betterSelectInit;
    this.#wrapperEl.replaceWith(this.#element);
  }

  /**
   * reinitialize the custom select
   */
  reInit() {
    const raf = window.requestAnimationFrame;
    raf(() => {
      this.destroy();
      raf(() => this.#initialize());
    });
  }

  /**
   * refresh the options in the dropdown
   */
  refreshOptions() {
    this.#createDropdown();
    this.updateUI();
  }

  #checkIfMobile() {
    if (!this.mobileMediaQuery) return;

    this.#isMobile = this.mobileMediaQuery.matches;
    this.#element.style.visibility = this.#isMobile ? 'visible' : 'hidden';
    this.#element.style.zIndex = this.#isMobile ? 2 : 1;
    if (this.#isMobile) {
      this.close();
    }
  }

  /**
   * toggle the dropdown status
   */
  toggle(newStatus = null) {
    if (newStatus === null) {
      newStatus = !this.#opened;
    }
    if (this.#triggerEvent(`betterSelect.${newStatus ? 'open' : 'close'}`)) {
      this.#wrapperEl.classList.toggle('open', newStatus);
      this.#dropdownEl.classList.toggle('open', newStatus);
      this.#opened = newStatus;
      if (this.#opened) {
        this.#element.focus();
      }
    }
  }

  /**
   * close the dropdown
   */
  close() {
    this.toggle(false);
  }

  /**
   * listen to events
   */
  #addListeners() {
    // listen to the changes to the original select
    ['change', 'selectActive'].forEach(type =>
      this.#element.addEventListener(type, () => this.updateUI())
    );

    // open the dropdown on click on the trigger
    this.#triggerEl.addEventListener('click', e => {
      e.stopPropagation();
      e.preventDefault();
      this.toggle();
    });

    // close the dropdown when clicking outside the custom select
    document.body.addEventListener('click', e => {
      if (this.#opened && !this.#wrapperEl.contains(e.target)) {
        this.close();
      }
    });

    // listen to clicks on dropdown options
    this.#wrapperEl.addEventListener('click', e => {
      if (!this.#dropdownEl.contains(e.target)) {
        return;
      }

      const item = e.target.closest('a');
      if (this.#dropdownEl.contains(item)) {
        e.stopPropagation();
        e.preventDefault();

        const selected = this.#options.find(({ element }) => element == item);
        if (selected.disabled) {
          return;
        }

        let shouldUpdate = true;
        if (selected && selected.value == this.#element.value) {
          shouldUpdate = false;
        } else if (!selected && !this.#element.value) {
          shouldUpdate = false;
        }

        if (shouldUpdate) {
          this.#element.value = selected.value;
          this.#element.dispatchEvent(new Event('change', { bubbles: true }));
        }
        this.close();
      }
    });

    // listen to media queries, to allow "native on mobile"
    if (this.#nativeOnMobile) {
      this.mobileMediaQuery.addListener(() => {
        this.#triggerEvent(`betterSelect.mobileBreakpoint`, {
          isMobile: this.mobileMediaQuery.matches,
        });
        this.#checkIfMobile();
      });
    }
  }

  get opened() {
    return this.#opened;
  }

  set opened(newStatus) {
    this.toggle(newStatus);
  }

  get settings() {
    return {
      element: this.#element,
      skipEmpty: this.#skipEmpty,
      placeholder: this.placeholder,
      zIndex: this.#zIndex,

      nativeOnMobile: this.#nativeOnMobile,
      mobileBreakpoint: this.#mobileBreakpoint,
      wrapperClass: this.#wrapperClass,
      triggerClass: this.#triggerClass,
      dropdownClass: this.#dropdownClass,
    };
  }

  get wrapperEl() {
    return this.#wrapperEl;
  }

  get triggerEl() {
    return this.#triggerEl;
  }

  get dropdownEl() {
    return this.#dropdownEl;
  }

  get select() {
    return this.#element;
  }

  get element() {
    return this.#element;
  }
}

// register as a jQuery plugin, if jQuery is available
if ('jQuery' in window) {
  (function ($) {
    $.fn.betterSelect = function (settings = {}) {
      this.each(function () {
        // don't initialize twice
        if (!this.betterSelectInstance) {
          new BetterSelect(this, settings);
        }
      });
      return this;
    };
  })(window.jQuery);
}
