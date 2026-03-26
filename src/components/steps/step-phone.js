'use strict';

import { validateRequired } from '../../validator.js';

function formatPhone(digits) {
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6,10)}`;
}

class StepPhone extends HTMLElement {
  connectedCallback() {
    const { label, help } = this.stepConfig;

    this.innerHTML = `
      <div class="step-question">${label}</div>
      ${help ? `<p class="step-help">${help}</p>` : ''}
      <div class="step-input-area">
        <input type="tel" inputmode="tel" placeholder="(555) 000-0000" autocomplete="tel" />
      </div>
    `;

    this._input = this.querySelector('input');

    if (this.value) {
      const digits = this.value.replace(/\D/g, '').slice(0, 10);
      this._input.value = formatPhone(digits);
    }

    this._input.addEventListener('input', () => {
      const cursor = this._input.selectionStart;
      const digits = this._input.value.replace(/\D/g, '').slice(0, 10);
      this._input.value = formatPhone(digits);
      // restore cursor roughly
      this._input.setSelectionRange(cursor, cursor);
    });

    requestAnimationFrame(() => this._input?.focus());
  }

  getValue() {
    return this._input?.value.replace(/\D/g, '') ?? '';
  }

  validate() {
    const { required } = this.stepConfig;
    const val = this.getValue();

    if (required && !validateRequired(val)) {
      return { valid: false, error: 'Please enter a phone number.' };
    }
    return { valid: true, error: null };
  }
}

customElements.define('step-phone', StepPhone);
