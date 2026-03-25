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

// ── Camera ───────────────────────────────────────────────────
let activeStream = null;

function stopStream() {
  if (activeStream) {
    activeStream.getTracks().forEach(t => t.stop());
    activeStream = null;
  }
}

async function showCamera() {
  render(`
    <div class="camera-wrap">
      <p class="camera-label">Hold your ID flat and well-lit inside the frame</p>
      <div class="viewfinder">
        <video id="preview" autoplay playsinline muted></video>
        <div class="vf-overlay">
          <div class="vf-corner tl"></div>
          <div class="vf-corner tr"></div>
          <div class="vf-corner bl"></div>
          <div class="vf-corner br"></div>
        </div>
      </div>
      <p id="cam-status" class="cam-status">Starting camera…</p>
    </div>

    <button class="btn btn-primary" id="btn-capture" disabled>
      Take Photo
    </button>
    <button class="btn btn-secondary" id="btn-cancel">
      Cancel
    </button>
  `);

  document.getElementById('btn-cancel').addEventListener('click', () => {
    stopStream();
    showHome();
  });

  const video   = document.getElementById('preview');
  const status  = document.getElementById('cam-status');
  const btnCap  = document.getElementById('btn-capture');

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

  document.getElementById('btn-capture').addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    // Collect track settings BEFORE stopping the stream
    const track        = activeStream.getVideoTracks()[0];
    const trackSettings = track ? track.getSettings() : {};
    const capturedAt   = new Date();

    stopStream();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    // Estimate file size: base64 payload → bytes
    const base64Payload = dataUrl.split(',')[1] ?? '';
    const sizeBytes     = Math.round(base64Payload.length * 0.75);

    const meta = {
      'Captured at':   capturedAt.toLocaleString(),
      'Resolution':    `${canvas.width} × ${canvas.height} px`,
      'File size':     formatBytes(sizeBytes),
      'Facing mode':   trackSettings.facingMode  ?? 'unknown',
      'Frame rate':    trackSettings.frameRate != null
                         ? `${Math.round(trackSettings.frameRate)} fps`
                         : 'unknown',
      'Aspect ratio':  trackSettings.aspectRatio != null
                         ? trackSettings.aspectRatio.toFixed(2)
                         : 'unknown',
      'Device ID':     trackSettings.deviceId
                         ? trackSettings.deviceId.slice(0, 16) + '…'
                         : 'unknown',
    };

    showPreview(dataUrl, meta);
  });
}

// ── Helpers ───────────────────────────────────────────────────
function formatBytes(bytes) {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024 ** 2)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}

function buildMetaTable(meta) {
  const rows = Object.entries(meta).map(([k, v]) => `
    <tr>
      <td class="meta-key">${k}</td>
      <td class="meta-val">${v}</td>
    </tr>`).join('');
  return `<table class="meta-table">${rows}</table>`;
}

// ── Preview (review captured photo) ──────────────────────────
function showPreview(dataUrl, meta) {
  render(`
    <p class="camera-label">Review your photo — make sure it is clear and fully visible</p>

    <div class="preview-wrap">
      <img src="${dataUrl}" alt="Captured ID" class="preview-img" />
    </div>

    <div class="card meta-card">
      <p class="meta-heading">Photo metadata</p>
      ${buildMetaTable(meta)}
    </div>

    <button class="btn btn-primary" id="btn-use">
      Use This Photo
    </button>
    <button class="btn btn-secondary" id="btn-retake">
      Retake
    </button>
  `);

  document.getElementById('btn-retake').addEventListener('click', showCamera);
  document.getElementById('btn-use').addEventListener('click', () => {
    // next feature will consume dataUrl
    showHome();
  });
}

// ── Boot ─────────────────────────────────────────────────────
showHome();
