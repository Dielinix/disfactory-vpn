/* === 1. МНОГОСЛОЙНЫЙ КОСМИЧЕСКИЙ ДВИЖОК (ЗВЁЗДЫ, ЧАСТИЦЫ, КОМЕТЫ, РЯБЬ) === */
const spaceCanvas = document.getElementById('spaceCanvas');
const sCtx = spaceCanvas.getContext('2d');

let w = 0;
let h = 0;
let stars = [];
let particles = [];
let meteors = [];
let touchRipples = [];
let warpSpeed = 1;
let targetWarpSpeed = 1;

function resizeSpace() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = window.innerWidth;
  h = window.innerHeight;
  spaceCanvas.width = w * dpr;
  spaceCanvas.height = h * dpr;
  sCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function initSpace() {
  resizeSpace();
  stars = [];
  particles = [];

  const count = Math.floor((w * h) / 4200);
  for (let i = 0; i < count; i++) {
    const depth = Math.random(); // 0 = далеко, 1 = близко
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: depth * 1.25 + 0.25,
      alpha: depth * 0.65 + 0.2,
      vy: (depth * 0.22 + 0.04),
      phase: Math.random() * Math.PI * 2,
      twinkle: Math.random() * 0.025 + 0.006
    });
  }

  for (let i = 0; i < 36; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28 - 0.1,
      size: Math.random() * 1.9 + 0.7,
      alpha: Math.random() * 0.45 + 0.2
    });
  }
}

function spawnMeteor() {
  if (meteors.length > 2) return;
  meteors.push({
    x: Math.random() * w * 1.2,
    y: -20,
    vx: -(Math.random() * 4 + 4.5),
    vy: Math.random() * 4 + 4.5,
    len: Math.random() * 65 + 45,
    life: 1
  });
}

// Интерактивная гравитационная волна при касании экрана
window.addEventListener('pointerdown', (e) => {
  touchRipples.push({
    x: e.clientX,
    y: e.clientY,
    radius: 4,
    alpha: 0.35
  });
});

function renderSpace() {
  sCtx.clearRect(0, 0, w, h);
  warpSpeed += (targetWarpSpeed - warpSpeed) * 0.045;

  // 1. Мерцающие звёзды
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    s.phase += s.twinkle;
    const a = s.alpha * (0.65 + 0.35 * Math.sin(s.phase));

    s.y -= s.vy * warpSpeed;
    if (s.y < -6) {
      s.y = h + 6;
      s.x = Math.random() * w;
    }

    sCtx.beginPath();
    sCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    sCtx.fillStyle = `rgba(255, 255, 255, ${a.toFixed(3)})`;
    sCtx.fill();

    // Варп-шлейф при активном туннеле
    if (warpSpeed > 2.4 && s.r > 0.85) {
      sCtx.beginPath();
      sCtx.moveTo(s.x, s.y);
      sCtx.lineTo(s.x, s.y + s.vy * warpSpeed * 4.2);
      sCtx.strokeStyle = `rgba(255, 255, 255, ${(a * 0.32).toFixed(3)})`;
      sCtx.lineWidth = s.r * 0.85;
      sCtx.stroke();
    }
  }

  // 2. Дрейфующие частицы и созвездия
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx * (0.8 + warpSpeed * 0.25);
    p.y += p.vy * warpSpeed;

    if (p.x < -12) p.x = w + 12;
    if (p.x > w + 12) p.x = -12;
    if (p.y < -12) p.y = h + 12;
    if (p.y > h + 12) p.y = -12;

    const glow = sCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3.8);
    glow.addColorStop(0, `rgba(255, 255, 255, ${p.alpha})`);
    glow.addColorStop(1, 'rgba(255, 255, 255, 0)');

    sCtx.beginPath();
    sCtx.arc(p.x, p.y, p.size * 3.8, 0, Math.PI * 2);
    sCtx.fillStyle = glow;
    sCtx.fill();

    for (let j = i + 1; j < particles.length; j++) {
      const p2 = particles[j];
      const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
      if (dist < 100) {
        const lineA = (1 - dist / 100) * 0.13;
        sCtx.beginPath();
        sCtx.moveTo(p.x, p.y);
        sCtx.lineTo(p2.x, p2.y);
        sCtx.strokeStyle = `rgba(255, 255, 255, ${lineA.toFixed(3)})`;
        sCtx.lineWidth = 0.65;
        sCtx.stroke();
      }
    }
  }

  // 3. Редкие падающие звёзды
  if (Math.random() < 0.008) spawnMeteor();
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i];
    m.x += m.vx;
    m.y += m.vy;
    m.life -= 0.018;

    if (m.life <= 0) {
      meteors.splice(i, 1);
      continue;
    }

    const grad = sCtx.createLinearGradient(m.x, m.y, m.x - m.vx * 8, m.y - m.vy * 8);
    grad.addColorStop(0, `rgba(255, 255, 255, ${m.life * 0.75})`);
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    sCtx.beginPath();
    sCtx.moveTo(m.x, m.y);
    sCtx.lineTo(m.x - m.vx * 8, m.y - m.vy * 8);
    sCtx.strokeStyle = grad;
    sCtx.lineWidth = 1.3;
    sCtx.stroke();
  }

  // 4. Световая рябь от касаний
  for (let i = touchRipples.length - 1; i >= 0; i--) {
    const r = touchRipples[i];
    r.radius += 2.6;
    r.alpha -= 0.012;
    if (r.alpha <= 0) {
      touchRipples.splice(i, 1);
      continue;
    }
    sCtx.beginPath();
    sCtx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
    sCtx.strokeStyle = `rgba(255, 255, 255, ${r.alpha.toFixed(3)})`;
    sCtx.lineWidth = 1;
    sCtx.stroke();
  }

  requestAnimationFrame(renderSpace);
}

window.addEventListener('resize', () => {
  resizeSpace();
  resizeWaveCanvas();
});

initSpace();
renderSpace();

/* === 2. ОСЦИЛЛОГРАФ ПОТОКА ТРАФИКА === */
const waveCanvas = document.getElementById('trafficWave');
const wCtx = waveCanvas.getContext('2d');
let wavePhase = 0;
let waveAmplitude = 1.5;
let targetWaveAmplitude = 1.5;

function resizeWaveCanvas() {
  const rect = waveCanvas.parentElement.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  waveCanvas.width = rect.width * dpr;
  waveCanvas.height = rect.height * dpr;
  wCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function renderWave() {
  const width = waveCanvas.width / Math.min(window.devicePixelRatio || 1, 2);
  const height = waveCanvas.height / Math.min(window.devicePixelRatio || 1, 2);
  wCtx.clearRect(0, 0, width, height);

  waveAmplitude += (targetWaveAmplitude - waveAmplitude) * 0.06;
  wavePhase += 0.08;

  const midY = height / 2;

  // Основная белая волна
  wCtx.beginPath();
  for (let x = 0; x <= width; x += 3) {
    const envelope = Math.sin((x / width) * Math.PI);
    const y = midY +
      Math.sin(x * 0.045 + wavePhase) * waveAmplitude * envelope +
      Math.cos(x * 0.09 - wavePhase * 1.4) * (waveAmplitude * 0.45) * envelope;
    if (x === 0) wCtx.moveTo(x, y);
    else wCtx.lineTo(x, y);
  }
  wCtx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  wCtx.lineWidth = 1.3;
  wCtx.stroke();

  // Вторая эхо-волна
  wCtx.beginPath();
  for (let x = 0; x <= width; x += 4) {
    const envelope = Math.sin((x / width) * Math.PI);
    const y = midY + Math.sin(x * 0.035 - wavePhase * 0.8) * (waveAmplitude * 0.6) * envelope;
    if (x === 0) wCtx.moveTo(x, y);
    else wCtx.lineTo(x, y);
  }
  wCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  wCtx.lineWidth = 1;
  wCtx.stroke();

  requestAnimationFrame(renderWave);
}

resizeWaveCanvas();
renderWave();

/* === 3. ЭФФЕКТ ДЕШИФРОВКИ ТЕКСТА (SCRAMBLE) === */
const CIPHER_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%*+';

function scrambleText(element, finalText, duration = 420) {
  const start = performance.now();
  const length = finalText.length;

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const revealed = Math.floor(progress * length);
    let output = '';

    for (let i = 0; i < length; i++) {
      if (finalText[i] === ' ' || finalText[i] === '•' || finalText[i] === '.') {
        output += finalText[i];
      } else if (i < revealed) {
        output += finalText[i];
      } else {
        output += CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)];
      }
    }

    element.textContent = output;
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = finalText;
    }
  }

  requestAnimationFrame(update);
}

/* === 4. ЛОГИКА DISFACTORY VPN === */
const protocols = ['VLESS • REALITY', 'HYSTERIA 2', 'WIREGUARD • X'];
let protocolIndex = 0;

const servers = [
  { id: 'nl', tag: 'NL-01', flag: '🇳🇱', country: 'Нидерланды', city: 'Амстердам • Квантовый шлюз', ping: 24, ip: '94.142.241.19' },
  { id: 'fi', tag: 'FI-02', flag: '🇫🇮', country: 'Финляндия', city: 'Хельсинки • Северный узел', ping: 19, ip: '95.216.14.202' },
  { id: 'de', tag: 'DE-03', flag: '🇩🇪', country: 'Германия', city: 'Франкфурт • Ядро Европы', ping: 31, ip: '185.11.61.84' },
  { id: 'se', tag: 'SE-04', flag: '🇸🇪', country: 'Швеция', city: 'Стокгольм • Скандинавия', ping: 27, ip: '193.138.218.71' },
  { id: 'us', tag: 'US-05', flag: '🇺🇸', country: 'США', city: 'Нью-Йорк • Трансатлантика', ping: 98, ip: '104.248.55.12' },
  { id: 'jp', tag: 'JP-06', flag: '🇯🇵', country: 'Япония', city: 'Токио • Тихоокеанский луч', ping: 142, ip: '45.76.210.88' }
];

let state = 'disconnected';
let selectedServer = servers[0];
let seconds = 0;
let timerInterval = null;
let trafficInterval = null;
let connectTimeout = null;

const body = document.body;
const powerBtn = document.getElementById('powerBtn');
const wave1 = document.getElementById('wave1');
const wave2 = document.getElementById('wave2');
const statusText = document.getElementById('statusText');
const timerEl = document.getElementById('timer');
const ipLabel = document.getElementById('ipLabel');
const powerHint = document.getElementById('powerHint');
const downSpeed = document.getElementById('downSpeed');
const upSpeed = document.getElementById('upSpeed');
const protocolBtn = document.getElementById('protocolBtn');
const protocolLabel = document.getElementById('protocolLabel');

const openServersBtn = document.getElementById('openServersBtn');
const closeSheetBtn = document.getElementById('closeSheetBtn');
const sheetOverlay = document.getElementById('sheetOverlay');
const bottomSheet = document.getElementById('bottomSheet');
const serverListEl = document.getElementById('serverList');

function vibrate(pattern = 25) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function fireShockwaves() {
  [wave1, wave2].forEach(wEl => {
    wEl.classList.remove('active');
    void wEl.offsetWidth;
    wEl.classList.add('active');
  });
}

function formatTime(totalSec) {
  const hrs = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const secs = String(totalSec % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

function startTelemetry() {
  stopTelemetry();
  timerInterval = setInterval(() => {
    seconds++;
    timerEl.textContent = formatTime(seconds);
  }, 1000);

  trafficInterval = setInterval(() => {
    const down = (Math.random() * 22 + 5.4).toFixed(1);
    const up = (Math.random() * 6.8 + 1.2).toFixed(1);
    downSpeed.textContent = down;
    upSpeed.textContent = up;
    targetWaveAmplitude = 4 + Math.random() * 5.5;
  }, 950);
}

function stopTelemetry() {
  clearInterval(timerInterval);
  clearInterval(trafficInterval);
  seconds = 0;
  timerEl.textContent = '00:00:00';
  downSpeed.textContent = '0.0';
  upSpeed.textContent = '0.0';
  targetWaveAmplitude = 1.5;
}

function setDisconnected() {
  clearTimeout(connectTimeout);
  state = 'disconnected';
  body.className = '';
  targetWarpSpeed = 1;
  scrambleText(statusText, 'ОЖИДАНИЕ КАНАЛА', 350);
  scrambleText(ipLabel, '185.220.101.4 • UNSECURED', 400);
  powerHint.textContent = 'Коснитесь ядра для шифрования';
  stopTelemetry();
}

function startConnecting() {
  clearTimeout(connectTimeout);
  state = 'connecting';
  body.className = 'connecting';
  targetWarpSpeed = 3.2;
  targetWaveAmplitude = 4.5;
  scrambleText(statusText, 'СИНХРОНИЗАЦИЯ...', 320);
  powerHint.textContent = `Квантовый рукопожатие: ${selectedServer.tag}...`;

  connectTimeout = setTimeout(() => {
    state = 'connected';
    body.className = 'connected';
    targetWarpSpeed = 6.2;
    scrambleText(statusText, 'ТУННЕЛЬ ЗАЩИЩЁН', 420);
    scrambleText(ipLabel, `${selectedServer.ip} • ${selectedServer.tag}`, 480);
    powerHint.textContent = 'Шифрование активно • Нажмите для разрыва';
    fireShockwaves();
    vibrate([25, 45, 35]);
    startTelemetry();
  }, 1450);
}

powerBtn.addEventListener('click', () => {
  vibrate(25);
  fireShockwaves();
  if (state === 'disconnected') {
    startConnecting();
  } else {
    setDisconnected();
  }
});

// Переключение протокола в шапке
protocolBtn.addEventListener('click', () => {
  vibrate(15);
  protocolIndex = (protocolIndex + 1) % protocols.length;
  scrambleText(protocolLabel, protocols[protocolIndex], 280);
});

/* === 5. ШТОРКА ВЫБОРА УЗЛОВ === */
function renderServerList() {
  serverListEl.innerHTML = servers.map((srv, idx) => `
    <div class="server-option ${srv.id === selectedServer.id ? 'active' : ''}" data-id="${srv.id}" style="--i: ${idx}">
      <div class="server-left">
        <div class="flag-box">
          <span class="flag-emoji">${srv.flag}</span>
        </div>
        <div class="server-meta">
          <div class="server-title-row">
            <span class="server-country">${srv.country}</span>
            <span class="node-tag">${srv.tag}</span>
          </div>
          <span class="server-city">${srv.city}</span>
        </div>
      </div>
      <div class="ping-pill">
        <span class="signal-bars"><i></i><i></i><i></i></span>
        <span>${srv.ping} ms</span>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.server-option').forEach(item => {
    item.addEventListener('click', () => {
      vibrate(20);
      const chosen = servers.find(s => s.id === item.dataset.id);
      if (!chosen) return;
      selectedServer = chosen;

      document.getElementById('currentFlag').textContent = chosen.flag;
      document.getElementById('currentCountry').textContent = chosen.country;
      document.getElementById('currentNodeTag').textContent = chosen.tag;
      document.getElementById('currentCity').textContent = chosen.city;
      document.getElementById('currentPing').textContent = `${chosen.ping} ms`;

      renderServerList();
      closeSheet();

      if (state === 'connected') {
        stopTelemetry();
        startConnecting();
      } else {
        scrambleText(ipLabel, `185.220.101.4 • READY (${chosen.tag})`, 350);
      }
    });
  });
}

function openSheet() {
  vibrate(15);
  renderServerList();
  sheetOverlay.classList.add('open');
  bottomSheet.classList.add('open');
}

function closeSheet() {
  sheetOverlay.classList.remove('open');
  bottomSheet.classList.remove('open');
}

openServersBtn.addEventListener('click', openSheet);
closeSheetBtn.addEventListener('click', closeSheet);
sheetOverlay.addEventListener('click', closeSheet);
