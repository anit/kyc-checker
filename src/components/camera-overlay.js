'use strict';

import { requestLocation } from '../location.js';

const tpl = document.createElement('template');
tpl.innerHTML = `
  <video autoplay playsinline muted></video>
  <div class="cam-ui">
    <p class="cam-status-fs">Starting camera…</p>
    <div class="cam-actions">
      <button class="btn-flip" title="Flip camera">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 4v6h6"/><path d="M23 20v-6h-6"/>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
        </svg>
      </button>
      <button class="btn-shutter" disabled></button>
      <div class="btn-flip-spacer"></div>
    </div>
  </div>
  <button class="btn-cam-cancel">&#x2715;</button>
`;

class CameraOverlay extends HTMLElement {
  #stream = null;
  #facing = 'environment';

  connectedCallback() {
    this.className = 'camera-overlay';
    this.appendChild(tpl.content.cloneNode(true));

    this._video   = this.querySelector('video');
    this._status  = this.querySelector('.cam-status-fs');
    this._btnCap  = this.querySelector('.btn-shutter');
    this._btnFlip = this.querySelector('.btn-flip');

    this.querySelector('.btn-cam-cancel').addEventListener('click', () => {
      this.#stop();
      this.dispatchEvent(new CustomEvent('cancel', { bubbles: true }));
    });

    this._btnFlip.addEventListener('click', async () => {
      this.#facing = this.#facing === 'environment' ? 'user' : 'environment';
      await this.#start();
    });

    this._btnCap.addEventListener('click', () => {
      const vW = this._video.videoWidth;
      const vH = this._video.videoHeight;
      const cW = this._video.clientWidth;
      const cH = this._video.clientHeight;

      // Replicate object-fit: cover — find the crop region in video pixel space
      const scale = Math.max(cW / vW, cH / vH);
      const cropW = cW / scale;
      const cropH = cH / scale;
      const cropX = (vW - cropW) / 2;
      const cropY = (vH - cropH) / 2;

      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(cropW);
      canvas.height = Math.round(cropH);
      const ctx = canvas.getContext('2d');
      if (this.#facing === 'user') { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
      ctx.drawImage(this._video, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);
      this.#stop();
      this.dispatchEvent(new CustomEvent('capture', {
        bubbles: true,
        detail: { dataUrl: canvas.toDataURL('image/jpeg', 0.92), locationPromise: this._locationPromise },
      }));
    });

    this._locationPromise = requestLocation();

    if (!navigator.mediaDevices?.getUserMedia) {
      this._status.textContent = 'Camera not available — this page must be opened over HTTPS.';
      this._status.style.color = '#ef4444';
      return;
    }

    this.#start();
  }

  async #start() {
    this.#stop();
    this._btnCap.disabled  = true;
    this._btnFlip.disabled = true;
    this._status.textContent = 'Starting camera…';
    this._status.style.color = '';
    this._video.style.transform = this.#facing === 'user' ? 'scaleX(-1)' : '';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: this.#facing }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      this.#stream = stream;
      this._video.srcObject = stream;
      await this._video.play();
      this._status.textContent = 'Camera ready — position your ID';
      this._btnCap.disabled  = false;
      this._btnFlip.disabled = false;
    } catch (err) {
      this._status.textContent = `Camera error: ${err.message}`;
      this._status.style.color = '#ef4444';
    }
  }

  #stop() {
    this.#stream?.getTracks().forEach(t => t.stop());
    this.#stream = null;
  }
}

customElements.define('camera-overlay', CameraOverlay);
