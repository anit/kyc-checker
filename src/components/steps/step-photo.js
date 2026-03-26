'use strict';

import { validateRequired } from '../../validator.js';

class StepPhoto extends HTMLElement {
  #captured = null;

  connectedCallback() {
    const { label, help } = this.stepConfig;

    this.innerHTML = `
      <div class="step-question">${label}</div>
      ${help ? `<p class="step-help">${help}</p>` : ''}
      <div class="step-input-area">
        <div class="photo-prompt" id="photo-prompt">
          <div class="photo-icon">📷</div>
          <p style="font-size:.9rem;color:var(--text-muted);line-height:1.5;">
            A live photo will be taken using your camera.
          </p>
          <button class="btn btn-primary" id="btn-take-photo">Take Photo</button>
        </div>
        <div id="photo-preview" style="display:none;">
          <div class="photo-thumb-wrap">
            <img id="photo-thumb" alt="Captured photo" />
          </div>
          <button class="btn btn-secondary photo-retake-btn" id="btn-retake">Retake Photo</button>
        </div>
      </div>
    `;

    if (this.value?.dataUrl) {
      this.setCaptured(this.value);
    }

    this.querySelector('#btn-take-photo').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('photo-capture-requested', { bubbles: true }));
    });

    this.querySelector('#btn-retake').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('photo-capture-requested', { bubbles: true }));
    });
  }

  setCaptured(detail) {
    this.#captured = detail;
    const prompt  = this.querySelector('#photo-prompt');
    const preview = this.querySelector('#photo-preview');
    const thumb   = this.querySelector('#photo-thumb');
    if (prompt && preview && thumb) {
      thumb.src = detail.dataUrl;
      prompt.style.display  = 'none';
      preview.style.display = '';
    }
  }

  getValue() {
    return this.#captured;
  }

  validate() {
    const { required } = this.stepConfig;
    if (required && !this.#captured) {
      return { valid: false, error: 'Please take a photo to continue.' };
    }
    return { valid: true, error: null };
  }
}

customElements.define('step-photo', StepPhoto);
