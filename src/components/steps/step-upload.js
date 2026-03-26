'use strict';

import { validateRequired } from '../../validator.js';

class StepUpload extends HTMLElement {
  #file = null;

  connectedCallback() {
    const { label, help, validation = {} } = this.stepConfig;
    const accept = validation.accept ?? '';

    this.innerHTML = `
      <div class="step-question">${label}</div>
      ${help ? `<p class="step-help">${help}</p>` : ''}
      <div class="step-input-area">
        <label class="upload-zone" id="upload-zone">
          <input type="file" style="display:none" ${accept ? `accept="${accept}"` : ''} />
          <div class="upload-icon">📎</div>
          <div class="upload-label"><strong>Tap to browse</strong><br>or drag and drop a file</div>
          <div class="upload-filename" id="upload-filename" style="display:none"></div>
        </label>
      </div>
    `;

    const input    = this.querySelector('input[type="file"]');
    const zone     = this.querySelector('#upload-zone');
    const filename = this.querySelector('#upload-filename');

    if (this.value instanceof File) {
      this.#file = this.value;
      this.#showFile(zone, filename, this.value.name);
    }

    input.addEventListener('change', () => {
      if (input.files[0]) {
        this.#file = input.files[0];
        this.#showFile(zone, filename, this.#file.name);
      }
    });

    zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = 'var(--accent)'; });
    zone.addEventListener('dragleave', () => { zone.style.borderColor = ''; });
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.style.borderColor = '';
      const dropped = e.dataTransfer.files[0];
      if (dropped) {
        this.#file = dropped;
        this.#showFile(zone, filename, dropped.name);
      }
    });
  }

  #showFile(zone, filename, name) {
    zone.classList.add('has-file');
    filename.textContent = name;
    filename.style.display = '';
    zone.querySelector('.upload-label').style.display = 'none';
    zone.querySelector('.upload-icon').textContent = '✅';
  }

  getValue() {
    return this.#file;
  }

  validate() {
    const { required } = this.stepConfig;
    if (required && !this.#file) {
      return { valid: false, error: 'Please select a file to continue.' };
    }
    return { valid: true, error: null };
  }
}

customElements.define('step-upload', StepUpload);
