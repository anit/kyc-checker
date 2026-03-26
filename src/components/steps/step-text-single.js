'use strict';

import { validateRequired, validateLength, validateRegex } from '../../validator.js';

class StepTextSingle extends HTMLElement {
  connectedCallback() {
    const { label, help, validation = {} } = this.stepConfig;
    const { len = {} } = validation;

    this.innerHTML = `
      <div class="step-question">${label}</div>
      ${help ? `<p class="step-help">${help}</p>` : ''}
      <div class="step-input-area">
        <input type="text" autocomplete="off" spellcheck="true"
          maxlength="${len.max ?? 500}"
          placeholder="Type your answer…" />
      </div>
    `;

    this._input = this.querySelector('input');
    if (this.value) this._input.value = this.value;

    // Focus on next frame so keyboard appears on mobile
    requestAnimationFrame(() => this._input?.focus());
  }

  getValue() {
    return this._input?.value.trim() ?? '';
  }

  validate() {
    const { required, validation = {} } = this.stepConfig;
    const { len = {}, regex } = validation;
    const val = this.getValue();

    if (required && !validateRequired(val)) {
      return { valid: false, error: 'This field is required.' };
    }
    if (val) {
      const lenCheck = validateLength(val, { min: len.min ?? 1, max: len.max ?? 500 });
      if (!lenCheck.valid) return lenCheck;
      const reCheck = validateRegex(val, regex);
      if (!reCheck.valid) return reCheck;
    }
    return { valid: true, error: null };
  }
}

customElements.define('step-text-single', StepTextSingle);
