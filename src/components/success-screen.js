'use strict';

import { ZipBuilder } from '../zip-builder.js';

const tpl = document.createElement('template');
tpl.innerHTML = `
  <div class="success-screen">
    <div class="success-icon">✓</div>
    <h2 class="success-title">All done!</h2>
    <p class="success-body">
      Your responses have been recorded. You can download a copy of everything you submitted below.
    </p>
    <div class="success-actions">
      <button class="btn btn-primary" id="btn-download">Download Responses</button>
    </div>
  </div>
`;

class SuccessScreen extends HTMLElement {
  connectedCallback() {
    this.appendChild(tpl.content.cloneNode(true));

    const btn = this.querySelector('#btn-download');
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = 'Generating…';
      btn.classList.add('btn-download-generating');
      try {
        const blob = await ZipBuilder.build(this.steps, this.answers);
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = 'responses.zip';
        a.click();
        URL.revokeObjectURL(url);
        btn.textContent = 'Downloaded ✓';
      } catch (err) {
        console.error('ZIP generation failed:', err);
        btn.textContent = 'Download failed — try again';
        btn.disabled = false;
        btn.classList.remove('btn-download-generating');
      }
    });
  }
}

customElements.define('success-screen', SuccessScreen);
