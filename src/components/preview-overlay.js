'use strict';

const tpl = document.createElement('template');
tpl.innerHTML = `
  <img alt="Captured ID" class="preview-img" />
  <div class="preview-bottom">
    <div class="location-row location-pending">Fetching location&hellip;</div>
    <div class="preview-actions">
      <button class="btn btn-secondary">Retake</button>
      <button class="btn btn-primary">Use Photo</button>
    </div>
  </div>
`;

class PreviewOverlay extends HTMLElement {
  connectedCallback() {
    this.className = 'preview-overlay';
    this.appendChild(tpl.content.cloneNode(true));

    this.querySelector('img').src = this.dataUrl;

    const loc = this.querySelector('.location-row');

    this.locationPromise.then(position => {
      if (!this.isConnected) return;
      if (position) {
        const c = position.coords;

        const pin = document.createElement('span');
        pin.className = 'location-pin';
        pin.textContent = '●';

        const coords = document.createElement('span');
        coords.textContent = `${c.latitude.toFixed(6)}°, ${c.longitude.toFixed(6)}° `;

        const acc = document.createElement('span');
        acc.className = 'location-acc';
        acc.textContent = `±${Math.round(c.accuracy)} m`;

        coords.appendChild(acc);
        loc.className = 'location-row';
        loc.replaceChildren(pin, coords);
      } else {
        loc.className = 'location-row location-denied';
        loc.textContent = 'Location unavailable';
      }
    });

    const [btnRetake, btnUse] = this.querySelectorAll('button');
    btnRetake.addEventListener('click', () =>
      this.dispatchEvent(new CustomEvent('retake', { bubbles: true })));
    btnUse.addEventListener('click', () =>
      this.dispatchEvent(new CustomEvent('use', { bubbles: true })));
  }
}

customElements.define('preview-overlay', PreviewOverlay);
