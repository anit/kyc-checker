'use strict';

import { validateRequired, validateLength, validateRegex } from '../../validator.js';

class StepTextMulti extends HTMLElement {
  connectedCallback() {
    const { label, help, validation = {} } = this.stepConfig;
    const { len = {} } = validation;

    this.innerHTML = `
      <div class="step-question">${label}</div>
      ${help ? `<p class="step-help">${help}</p>` : ''}
      <div class="step-input-area">
        <textarea
          maxlength="${len.max ?? 2000}"
          placeholder="Type your answer…"
          rows="5"
        ></textarea>
      </div>
    `;

    this._ta = this.querySelector('textarea');
    if (this.value) this._ta.value = this.value;

    this._ta.addEventListener('input', () => {
      this._ta.style.height = 'auto';
      this._ta.style.height = this._ta.scrollHeight + 'px';
    });

    requestAnimationFrame(() => this._ta?.focus());
  }

  getValue() {
    return this._ta?.value.trim() ?? '';
  }

  validate() {
    const { required, validation = {} } = this.stepConfig;
    const { len = {}, regex } = validation;
    const val = this.getValue();

    if (required && !validateRequired(val)) {
      return { valid: false, error: 'This field is required.' };
    }
    if (val) {
      const lenCheck = validateLength(val, { min: len.min ?? 1, max: len.max ?? 2000 });
      if (!lenCheck.valid) return lenCheck;
      const reCheck = validateRegex(val, regex);
      if (!reCheck.valid) return reCheck;
    }
    return { valid: true, error: null };
  }
}

customElements.define('step-text-multi', StepTextMulti);
