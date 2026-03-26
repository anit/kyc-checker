'use strict';

import { validateRequired } from '../../validator.js';

class StepAmount extends HTMLElement {
  connectedCallback() {
    const { label, help } = this.stepConfig;

    this.innerHTML = `
      <div class="step-question">${label}</div>
      ${help ? `<p class="step-help">${help}</p>` : ''}
      <div class="step-input-area">
        <div class="amount-wrapper">
          <span class="amount-prefix">$</span>
          <input type="number" inputmode="decimal" min="0" step="0.01"
            placeholder="0.00" />
        </div>
      </div>
    `;

    this._input = this.querySelector('input');
    if (this.value != null) this._input.value = this.value;

    requestAnimationFrame(() => this._input?.focus());
  }

  getValue() {
    return this._input?.value ?? '';
  }

  validate() {
    const { required } = this.stepConfig;
    const val = this.getValue();

    if (required && !validateRequired(val)) {
      return { valid: false, error: 'Please enter an amount.' };
    }
    if (val !== '') {
      const num = parseFloat(val);
      if (isNaN(num) || num < 0) {
        return { valid: false, error: 'Please enter a valid non-negative amount.' };
      }
    }
    return { valid: true, error: null };
  }
}

customElements.define('step-amount', StepAmount);
