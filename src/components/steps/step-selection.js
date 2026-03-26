'use strict';

import { validateRequired, validateMaxSelect } from '../../validator.js';

class StepSelection extends HTMLElement {
  #selected = [];

  connectedCallback() {
    const { label, help, options = [], validation = {} } = this.stepConfig;
    const maxSelect = validation.maxSelect ?? 1;
    const isMulti   = maxSelect > 1;

    this.innerHTML = `
      <div class="step-question">${label}</div>
      ${help ? `<p class="step-help">${help}</p>` : ''}
      <div class="step-input-area">
        <div class="selection-list">
          ${options.map((opt, i) => {
            const val   = typeof opt === 'object' ? opt.value : opt;
            const text  = typeof opt === 'object' ? opt.label : opt;
            return `
              <label class="selection-option${isMulti ? ' multi' : ''}" data-value="${val}" data-index="${i}">
                <input type="${isMulti ? 'checkbox' : 'radio'}" value="${val}" />
                <span class="selection-indicator"></span>
                <span class="selection-label">${text}</span>
              </label>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Restore prior selection
    if (this.value) {
      this.#selected = Array.isArray(this.value) ? this.value : [this.value];
      this.#selected.forEach(v => {
        const opt = this.querySelector(`[data-value="${v}"]`);
        if (opt) {
          opt.classList.add('selected');
          const inp = opt.querySelector('input');
          if (inp) inp.checked = true;
        }
      });
    }

    this.querySelectorAll('.selection-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.preventDefault();
        const val = opt.dataset.value;
        if (isMulti) {
          if (this.#selected.includes(val)) {
            this.#selected = this.#selected.filter(v => v !== val);
            opt.classList.remove('selected');
            opt.querySelector('input').checked = false;
          } else {
            this.#selected = [...this.#selected, val];
            opt.classList.add('selected');
            opt.querySelector('input').checked = true;
          }
        } else {
          // Radio: deselect all, select clicked
          this.querySelectorAll('.selection-option').forEach(o => {
            o.classList.remove('selected');
            o.querySelector('input').checked = false;
          });
          this.#selected = [val];
          opt.classList.add('selected');
          opt.querySelector('input').checked = true;
        }
      });
    });
  }

  getValue() {
    const maxSelect = this.stepConfig.validation?.maxSelect ?? 1;
    return maxSelect === 1 ? (this.#selected[0] ?? null) : this.#selected;
  }

  validate() {
    const { required, validation = {} } = this.stepConfig;
    const maxSelect = validation.maxSelect ?? 1;

    if (required && !validateRequired(this.#selected)) {
      return { valid: false, error: 'Please select an option to continue.' };
    }
    const maxCheck = validateMaxSelect(this.#selected, maxSelect);
    if (!maxCheck.valid) return maxCheck;
    return { valid: true, error: null };
  }
}

customElements.define('step-selection', StepSelection);
