'use strict';

import { loadConfig } from './config-loader.js';
import { FormRunner  } from './form-runner.js';
import './components/home-screen.js';
import './components/camera-overlay.js';
import './components/preview-overlay.js';

const appEl  = document.getElementById('app');
const screen = document.querySelector('.screen');

const cfg = loadConfig();
if (cfg) {
  new FormRunner(appEl, screen, cfg).start();
} else {
  showHome();
}

function showHome() {
  const el = document.createElement('home-screen');
  el.addEventListener('start', launchCamera);
  appEl.replaceChildren(el);
}

function launchCamera() {
  const cam = document.createElement('camera-overlay');
  cam.addEventListener('cancel',  () => { cam.remove(); showHome(); });
  cam.addEventListener('capture', e  => { cam.remove(); showPreview(e.detail); });
  screen.appendChild(cam);
}

function showPreview({ dataUrl, locationPromise }) {
  const pv = Object.assign(document.createElement('preview-overlay'), { dataUrl, locationPromise });
  pv.addEventListener('retake', () => { pv.remove(); launchCamera(); });
  pv.addEventListener('use',    () => { pv.remove(); showHome(); });
  screen.appendChild(pv);
}
