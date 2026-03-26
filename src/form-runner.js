'use strict';

import './components/form-shell.js';
import './components/success-screen.js';
import './components/camera-overlay.js';
import './components/preview-overlay.js';
import './components/steps/step-text-single.js';
import './components/steps/step-text-multi.js';
import './components/steps/step-amount.js';
import './components/steps/step-phone.js';
import './components/steps/step-photo.js';
import './components/steps/step-upload.js';
import './components/steps/step-selection.js';
import './components/steps/step-datetime.js';

const STEP_COMPONENTS = {
  'text-single': 'step-text-single',
  'text-multi':  'step-text-multi',
  'amount':      'step-amount',
  'phone':       'step-phone',
  'photo':       'step-photo',
  'upload':      'step-upload',
  'selection':   'step-selection',
  'datetime':    'step-datetime',
};

export class FormRunner {
  #appEl;
  #screen;
  #config;
  #steps;
  #answers  = {};
  #index    = 0;
  #shell    = null;
  #stepEl   = null;

  constructor(appEl, screen, config) {
    this.#appEl   = appEl;
    this.#screen  = screen;
    this.#config  = config;
    this.#steps   = config.form ?? [];
  }

  start() {
    // Update header title
    const titleEl = document.querySelector('.app-title');
    if (titleEl) titleEl.textContent = this.#config.name || 'Form';

    // Apply branding accent if provided
    if (this.#config.branding?.accent) {
      document.documentElement.style.setProperty('--accent', this.#config.branding.accent);
    }

    // Remove default padding from app-main
    this.#appEl.classList.add('app-main--form');

    // Create and mount the shell
    this.#shell = document.createElement('form-shell');
    this.#appEl.replaceChildren(this.#shell);

    this.#shell.addEventListener('form-next', () => this.#handleNext());
    this.#shell.addEventListener('form-back', () => this.#handleBack());

    this.#renderStep(0);
  }

  #renderStep(index) {
    this.#index = index;
    const step  = this.#steps[index];
    const total = this.#steps.length;
    const tag   = STEP_COMPONENTS[step.type];

    if (!tag) {
      console.warn(`[form] Unknown step type: "${step.type}" — skipping`);
      if (index + 1 < total) this.#renderStep(index + 1);
      else this.#showSuccess();
      return;
    }

    const el       = document.createElement(tag);
    el.stepConfig  = step;
    el.value       = this.#answers[index];
    this.#stepEl   = el;

    this.#shell.setProgress(index + 1, total);
    this.#shell.setBackVisible(index > 0);
    this.#shell.setNextLabel(index === total - 1 ? 'Submit' : 'Next');
    this.#shell.setStep(el);

    // Photo step: listen for camera request on the element
    if (step.type === 'photo') {
      el.addEventListener('photo-capture-requested', () => {
        this.#launchCameraForStep(index, detail => {
          el.setCaptured(detail);
        });
      });
    }
  }

  #handleNext() {
    const result = this.#stepEl.validate();
    if (!result.valid) {
      this.#shell.showError(result.error);
      return;
    }
    this.#shell.clearError();
    this.#answers[this.#index] = this.#stepEl.getValue();

    const next = this.#index + 1;
    if (next < this.#steps.length) {
      this.#renderStep(next);
    } else {
      this.#showSuccess();
    }
  }

  #handleBack() {
    if (this.#index > 0) {
      this.#renderStep(this.#index - 1);
    }
  }

  #launchCameraForStep(index, onCapture) {
    const cam = document.createElement('camera-overlay');

    cam.addEventListener('cancel', () => {
      cam.remove();
      // User cancelled — stay on photo step, no action needed
    });

    cam.addEventListener('capture', e => {
      cam.remove();
      const pv = Object.assign(document.createElement('preview-overlay'), {
        dataUrl: e.detail.dataUrl,
        locationPromise: e.detail.locationPromise,
      });

      pv.addEventListener('retake', () => {
        pv.remove();
        this.#launchCameraForStep(index, onCapture);
      });

      pv.addEventListener('use', () => {
        pv.remove();
        onCapture(e.detail);
      });

      this.#screen.appendChild(pv);
    });

    this.#screen.appendChild(cam);
  }

  #showSuccess() {
    const el      = document.createElement('success-screen');
    el.answers    = this.#answers;
    el.steps      = this.#steps;
    this.#appEl.replaceChildren(el);
  }
}
