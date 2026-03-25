'use strict';

// ── App shell ────────────────────────────────────────────────
const app = document.getElementById('app');

function render(html) {
  app.innerHTML = html;
}

// ── Views ────────────────────────────────────────────────────
function showHome() {
  render(`
    <div class="card">
      <p style="font-size:.95rem;line-height:1.6;color:#374151;">
        Please have your <strong>government-issued ID</strong> ready.
        You will be asked to take a live photo — uploads are not accepted.
      </p>
    </div>

    <button class="btn btn-primary" id="btn-start">
      Start Verification
    </button>
  `);

  document.getElementById('btn-start').addEventListener('click', showCamera);
}

// ── Geolocation ───────────────────────────────────────────────
function requestLocation() {
  return new Promise(resolve => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      pos => resolve(pos),
      ()  => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

// ── Camera ───────────────────────────────────────────────────
let activeStream = null;

function stopStream() {
  if (activeStream) {
    activeStream.getTracks().forEach(t => t.stop());
    activeStream = null;
  }
}

async function showCamera() {
  // Camera overlay lives on .screen, not inside the scrollable app-main
  const screen = document.querySelector('.screen');
  const overlay = document.createElement('div');
  overlay.className = 'camera-overlay';
  overlay.innerHTML = `
    <video id="preview" autoplay playsinline muted></video>
    <div class="cam-ui">
      <p id="cam-status" class="cam-status-fs">Starting camera…</p>
      <div class="cam-actions">
        <button class="btn-shutter" id="btn-capture" disabled></button>
      </div>
    </div>
    <button class="btn-cam-cancel" id="btn-cancel">✕</button>
  `;
  screen.appendChild(overlay);

  function closeOverlay() {
    stopStream();
    overlay.remove();
  }

  document.getElementById('btn-cancel').addEventListener('click', () => {
    closeOverlay();
    showHome();
  });

  const video  = document.getElementById('preview');
  const status = document.getElementById('cam-status');
  const btnCap = document.getElementById('btn-capture');

  // Start location fetch early — likely resolved by shutter time
  const locationPromise = requestLocation();

  if (!navigator.mediaDevices?.getUserMedia) {
    status.textContent = 'Camera not available — this page must be opened over HTTPS.';
    status.style.color = '#ef4444';
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        width:  { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    });

    activeStream   = stream;
    video.srcObject = stream;

    await video.play();
    status.textContent = 'Camera ready — position your ID';
    btnCap.disabled = false;

  } catch (err) {
    status.textContent = `Camera error: ${err.message}`;
    status.style.color = '#ef4444';
    return;
  }

  document.getElementById('btn-capture').addEventListener('click', async () => {
    const canvas = document.createElement('canvas');
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    // Give location up to 3 s more if not yet resolved
    const timeout = new Promise(r => setTimeout(() => r(null), 3000));
    const position = await Promise.race([locationPromise, timeout]);

    closeOverlay();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    // ── GPS location ──────────────────────────────────────────
    let locationSection = null;
    if (position) {
      const c = position.coords;
      locationSection = {};
      locationSection['Latitude']  = `${c.latitude.toFixed(6)}°`;
      locationSection['Longitude'] = `${c.longitude.toFixed(6)}°`;
      locationSection['Accuracy']  = `±${Math.round(c.accuracy)} m`;
      if (c.altitude      != null) locationSection['Altitude']       = `${Math.round(c.altitude)} m`;
      if (c.altitudeAccuracy != null) locationSection['Alt. accuracy'] = `±${Math.round(c.altitudeAccuracy)} m`;
      if (c.heading       != null) locationSection['Heading']        = `${Math.round(c.heading)}°`;
      if (c.speed         != null) locationSection['Speed']          = `${c.speed.toFixed(1)} m/s`;
      locationSection['Fix time'] = new Date(position.timestamp).toLocaleTimeString();
    }

    showPreview(dataUrl, locationSection);
  });
}

// ── Preview (review captured photo) ──────────────────────────
function showPreview(dataUrl, location) {
  const locationHtml = location
    ? `<div class="location-row">
         <span class="location-pin">&#9679;</span>
         <span>${location['Latitude']}, ${location['Longitude']}
           <span class="location-acc">${location['Accuracy']}</span>
         </span>
       </div>`
    : `<div class="location-row location-denied">Location unavailable</div>`;

  const screen = document.querySelector('.screen');
  const overlay = document.createElement('div');
  overlay.className = 'preview-overlay';
  overlay.innerHTML = `
    <img src="${dataUrl}" alt="Captured ID" class="preview-img" />
    <div class="preview-bottom">
      <div class="preview-location">${locationHtml}</div>
      <div class="preview-actions">
        <button class="btn btn-secondary" id="btn-retake">Retake</button>
        <button class="btn btn-primary"   id="btn-use">Use Photo</button>
      </div>
    </div>
  `;
  screen.appendChild(overlay);

  document.getElementById('btn-retake').addEventListener('click', () => {
    overlay.remove();
    showCamera();
  });
  document.getElementById('btn-use').addEventListener('click', () => {
    overlay.remove();
    showHome();
  });
}

// ── Boot ─────────────────────────────────────────────────────
showHome();
