'use strict';

import { validateRequired } from '../../validator.js';

class StepDatetime extends HTMLElement {
  connectedCallback() {
    const { label, help } = this.stepConfig;

    this.innerHTML = `
      <div class="step-question">${label}</div>
      ${help ? `<p class="step-help">${help}</p>` : ''}
      <div class="step-input-area">
        <input type="datetime-local" />
      </div>
    `;

    this._input = this.querySelector('input');
    if (this.value) this._input.value = this.value;
  }

  getValue() {
    return this._input?.value ?? '';
  }

  validate() {
    const { required } = this.stepConfig;
    if (required && !validateRequired(this.getValue())) {
      return { valid: false, error: 'Please select a date and time.' };
    }
    return { valid: true, error: null };
  }
}

customElements.define('step-datetime', StepDatetime);
