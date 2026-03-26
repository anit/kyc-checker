'use strict';

const tpl = document.createElement('template');
tpl.innerHTML = `
  <div class="form-progress">
    <div class="form-progress-track">
      <div class="form-progress-fill" style="width:0%"></div>
    </div>
    <span class="form-progress-label">Step 1 of 1</span>
  </div>
  <div class="step-area"></div>
  <div class="form-nav">
    <button class="btn btn-secondary form-btn-back btn-back-hidden">Back</button>
    <button class="btn btn-primary form-btn-next">Next</button>
  </div>
`;

class FormShell extends HTMLElement {
  connectedCallback() {
    this.appendChild(tpl.content.cloneNode(true));

    this._fill  = this.querySelector('.form-progress-fill');
    this._label = this.querySelector('.form-progress-label');
    this._area  = this.querySelector('.step-area');
    this._back  = this.querySelector('.form-btn-back');
    this._next  = this.querySelector('.form-btn-next');
    this._error = null;

    this._back.addEventListener('click', () =>
      this.dispatchEvent(new CustomEvent('form-back', { bubbles: true })));

    this._next.addEventListener('click', () =>
      this.dispatchEvent(new CustomEvent('form-next', { bubbles: true })));
  }

  setProgress(current, total) {
    const pct = total > 0 ? Math.round((current / total) * 100) : 0;
    this._fill.style.width  = pct + '%';
    this._label.textContent = `Step ${current} of ${total}`;
  }

  setStep(el) {
    this.clearError();
    this._area.replaceChildren(el);
  }

  setBackVisible(visible) {
    this._back.classList.toggle('btn-back-hidden', !visible);
  }

  setNextLabel(label) {
    this._next.textContent = label;
  }

  showError(msg) {
    this.clearError();
    const div = document.createElement('div');
    div.className = 'form-error';
    div.textContent = msg;
    // Insert before the nav bar
    this._next.closest('.form-nav').before(div);
    this._error = div;
  }

  clearError() {
    this._error?.remove();
    this._error = null;
  }
}

customElements.define('form-shell', FormShell);
