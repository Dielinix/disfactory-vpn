/* === 1. МНОГОСЛОЙНЫЙ КОСМИЧЕСКИЙ ДВИЖОК === */
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
    const depth = Math.random();
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

    if (warpSpeed > 2.4 && s.r > 0.85) {
      sCtx.beginPath();
      sCtx.moveTo(s.x, s.y);
      sCtx.lineTo(s.x, s.y + s.vy * warpSpeed * 4.2);
      sCtx.strokeStyle = `rgba(255, 255, 255, ${(a * 0.32).toFixed(3)})`;
      sCtx.lineWidth = s.r * 0.85;
      sCtx.stroke();
    }
  }

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

  waveAmplitude += (targetWaveAmplitude - waveAmplitude) * 0.08;
  wavePhase += 0.08;

  const midY = height / 2;

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

/* === 3. ЭФФЕКТ ДЕШИФРОВКИ ТЕКСТА === */
const CIPHER_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%*+';

function scrambleText(element, finalText, duration = 360) {
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

/* === 4. ХРАНИЛИЩЕ И ПАРСЕР КЛЮЧЕЙ / ПОДПИСОК (1 В 1 КАК В HAPP) === */
const STORAGE_SERVERS = 'disfactory_servers_v1';
const STORAGE_SELECTED = 'disfactory_selected_id_v1';
const STORAGE_SUB = 'disfactory_subscription_v1';

let servers = [];
let selectedServerId = null;
let subscriptionMeta = null;

function loadStorage() {
  try {
    const rawServers = localStorage.getItem(STORAGE_SERVERS);
    servers = rawServers ? JSON.parse(rawServers) : [];
    selectedServerId = localStorage.getItem(STORAGE_SELECTED) || (servers[0] ? servers[0].id : null);
    const rawSub = localStorage.getItem(STORAGE_SUB);
    subscriptionMeta = rawSub ? JSON.parse(rawSub) : null;
  } catch (_) {
    servers = [];
    selectedServerId = null;
    subscriptionMeta = null;
  }
}

function saveStorage() {
  localStorage.setItem(STORAGE_SERVERS, JSON.stringify(servers));
  if (selectedServerId) {
    localStorage.setItem(STORAGE_SELECTED, selectedServerId);
  } else {
    localStorage.removeItem(STORAGE_SELECTED);
  }
  if (subscriptionMeta) {
    localStorage.setItem(STORAGE_SUB, JSON.stringify(subscriptionMeta));
  } else {
    localStorage.removeItem(STORAGE_SUB);
  }
}

function getSelectedServer() {
  return servers.find(s => s.id === selectedServerId) || null;
}

function extractFlagAndCleanName(rawName, fallbackHost) {
  const name = (rawName || '').trim() || fallbackHost;
  const flagMatch = name.match(/[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/);
  if (flagMatch) {
    const flag = flagMatch[0];
    const clean = name.replace(flag, '').trim() || fallbackHost;
    return { flag, name: clean };
  }

  const lower = name.toLowerCase();
  if (lower.includes('nl') || lower.includes('nether') || lower.includes('нидер') || lower.includes('amster')) return { flag: '🇳🇱', name };
  if (lower.includes('fi') || lower.includes('finland') || lower.includes('финлян') || lower.includes('helsinki')) return { flag: '🇫🇮', name };
  if (lower.includes('de') || lower.includes('german') || lower.includes('герман') || lower.includes('frankfurt')) return { flag: '🇩🇪', name };
  if (lower.includes('se') || lower.includes('swed') || lower.includes('швец') || lower.includes('stockholm')) return { flag: '🇸🇪', name };
  if (lower.includes('us') || lower.includes('usa') || lower.includes('сша') || lower.includes('york')) return { flag: '🇺🇸', name };
  if (lower.includes('gb') || lower.includes('uk') || lower.includes('london') || lower.includes('брита')) return { flag: '🇬🇧', name };
  if (lower.includes('pl') || lower.includes('poland') || lower.includes('польш') || lower.includes('warsaw')) return { flag: '🇵🇱', name };
  if (lower.includes('tr') || lower.includes('turk') || lower.includes('турц') || lower.includes('istanbul')) return { flag: '🇹🇷', name };
  if (lower.includes('jp') || lower.includes('japan') || lower.includes('япон') || lower.includes('tokyo')) return { flag: '🇯🇵', name };
  if (lower.includes('warp') || lower.includes('cloudflare')) return { flag: '☁️', name };

  return { flag: '🛰️', name };
}

function maskHost(host) {
  if (!host) return 'unknown';
  const parts = host.split('.');
  if (parts.length === 4 && parts.every(p => /^\d+$/.test(p))) {
    return `${parts[0]}.${parts[1]}.*.*`;
  }
  return host;
}

function parseSingleConfigLine(rawLine, source = 'manual') {
  const line = rawLine.trim();
  if (!line) return null;

  // 1. VLESS URI
  if (line.startsWith('vless://')) {
    try {
      const url = new URL(line);
      const host = url.hostname;
      const port = parseInt(url.port, 10) || 443;
      const security = (url.searchParams.get('security') || 'none').toUpperCase();
      const type = (url.searchParams.get('type') || 'tcp').toUpperCase();
      const remark = url.hash ? decodeURIComponent(url.hash.slice(1)) : `${host}:${port}`;
      const { flag, name } = extractFlagAndCleanName(remark, host);

      return {
        id: 'srv_' + Math.random().toString(36).slice(2, 10),
        flag,
        name,
        protocol: security === 'REALITY' ? 'VLESS • REALITY' : `VLESS • ${type}`,
        tag: 'VLESS',
        host,
        port,
        uri: line,
        ping: null,
        source
      };
    } catch (_) {
      return null;
    }
  }

  // 2. TROJAN URI
  if (line.startsWith('trojan://')) {
    try {
      const url = new URL(line);
      const host = url.hostname;
      const port = parseInt(url.port, 10) || 443;
      const remark = url.hash ? decodeURIComponent(url.hash.slice(1)) : `${host}:${port}`;
      const { flag, name } = extractFlagAndCleanName(remark, host);

      return {
        id: 'srv_' + Math.random().toString(36).slice(2, 10),
        flag,
        name,
        protocol: 'TROJAN • TLS',
        tag: 'TROJAN',
        host,
        port,
        uri: line,
        ping: null,
        source
      };
    } catch (_) {
      return null;
    }
  }

  return null;
}

function parseMultiPayload(text, source = 'manual') {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // Поддержка полного INI-конфига WireGuard
  if (trimmed.includes('[Interface]') && trimmed.includes('[Peer]')) {
    const epMatch = trimmed.match(/Endpoint\s*=\s*([^\s:]+):(\d+)/i);
    const host = epMatch ? epMatch[1] : 'engage.cloudflareclient.com';
    const port = epMatch ? parseInt(epMatch[2], 10) : 2408;
    const { flag, name } = extractFlagAndCleanName(
      host.includes('cloudflare') ? 'Cloudflare WARP' : `WireGuard (${host})`,
      host
    );
    return [{
      id: 'srv_' + Math.random().toString(36).slice(2, 10),
      flag,
      name,
      protocol: 'WIREGUARD',
      tag: 'WG',
      host,
      port,
      uri: trimmed,
      ping: null,
      source
    }];
  }

  // Попытка декодировать Base64-список из подписки
  let content = trimmed;
  if (!content.includes('://') && /^[A-Za-z0-9+/=_-]+$/.test(content.replace(/\s+/g, ''))) {
    try {
      const normalized = content.replace(/-/g, '+').replace(/_/g, '/');
      content = decodeURIComponent(escape(atob(normalized)));
    } catch (_) {
      try {
        content = atob(content.replace(/-/g, '+').replace(/_/g, '/'));
      } catch (__) {}
    }
  }

  const lines = content.split(/\r?\n/);
  const parsed = [];
  for (const l of lines) {
    const item = parseSingleConfigLine(l, source);
    if (item) parsed.push(item);
  }
  return parsed;
}

function parseSubscriptionHeaders(url, headersObj) {
  let profileName = 'DISFACTORY SUB';
  const rawTitle = headersObj['profile-title'] || headersObj['x-profile-title'];
  if (rawTitle) {
    if (rawTitle.startsWith('base64:')) {
      try {
        profileName = decodeURIComponent(escape(atob(rawTitle.slice(7).trim())));
      } catch (_) {
        profileName = rawTitle.slice(7).trim();
      }
    } else {
      profileName = rawTitle.trim();
    }
  } else {
    try {
      profileName = new URL(url).hostname;
    } catch (_) {}
  }

  let trafficText = 'Трафик: ∞';
  let expireText = 'Срок: безлимит';

  const userInfo = headersObj['subscription-userinfo'];
  if (userInfo) {
    const map = {};
    userInfo.split(';').forEach(part => {
      const [k, v] = part.trim().split('=');
      if (k && v) map[k.trim()] = Number(v.trim());
    });

    const used = (map.upload || 0) + (map.download || 0);
    const total = map.total || 0;
    if (total > 0) {
      const usedGB = (used / (1024 ** 3)).toFixed(1);
      const totalGB = (total / (1024 ** 3)).toFixed(0);
      trafficText = `Трафик: ${usedGB} / ${totalGB} ГБ`;
    } else if (used > 0) {
      const usedGB = (used / (1024 ** 3)).toFixed(2);
      trafficText = `Использовано: ${usedGB} ГБ`;
    }

    if (map.expire && map.expire > 0) {
      const msLeft = map.expire * 1000 - Date.now();
      const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
      expireText = daysLeft > 0 ? `Осталось: ${daysLeft} дн.` : 'Срок истёк';
    }
  }

  return { url, profileName, trafficText, expireText };
}

/* === 5. МОСТ VPN, ПРОВЕРКА ПИНГА И ПОДПИСОК === */
function getVpnBridge() {
  if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.DisfactoryVpn) {
    return window.Capacitor.Plugins.DisfactoryVpn;
  }
  if (window.disfactoryDesktopVpn) {
    return window.disfactoryDesktopVpn;
  }
  return null;
}

async function fetchSubscriptionRemote(url) {
  const bridge = getVpnBridge();
  if (bridge && typeof bridge.fetchSubscription === 'function') {
    return await bridge.fetchSubscription({ url });
  }

  const res = await fetch(url);
  const bodyText = await res.text();
  const headers = {};
  res.headers.forEach((val, key) => {
    headers[key.toLowerCase()] = val;
  });
  return { body: bodyText, headers };
}

async function pingSingleServer(srv) {
  const bridge = getVpnBridge();
  if (bridge && typeof bridge.pingServer === 'function') {
    const res = await bridge.pingServer({ host: srv.host, port: srv.port });
    srv.ping = res && typeof res.ping === 'number' ? res.ping : -1;
    return srv.ping;
  }

  // Резервный замер в браузере
  const start = performance.now();
  try {
    await fetch(`https://${srv.host}:${srv.port}`, { mode: 'no-cors', cache: 'no-store' });
    srv.ping = Math.max(12, Math.round(performance.now() - start));
  } catch (_) {
    const elapsed = Math.round(performance.now() - start);
    srv.ping = elapsed < 2500 ? Math.max(15, elapsed) : -1;
  }
  return srv.ping;
}

/* === 6. УПРАВЛЕНИЕ СОСТОЯНИЕМ И ТЕЛЕМЕТРИЕЙ === */
let state = 'disconnected';
let seconds = 0;
let timerInterval = null;
let trafficInterval = null;
let connectTimeout = null;

let lastRxBytes = null;
let lastTxBytes = null;
let lastStatsTime = 0;

const body = document.body;
const powerBtn = document.getElementById('powerBtn');
const wave1 = document.getElementById('wave1');
const wave2 = document.getElementById('wave2');
const statusText = document.getElementById('statusText');
const timerEl = document.getElementById('timer');
const ipLabel = document.getElementById('ipLabel');
const powerHint = document.getElementById('powerHint');
const protocolLabel = document.getElementById('protocolLabel');
const downSpeed = document.getElementById('downSpeed');
const downUnit = document.getElementById('downUnit');
const upSpeed = document.getElementById('upSpeed');
const upUnit = document.getElementById('upUnit');

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

function getSignalClass(ping) {
  if (ping === null || ping === undefined) return '';
  if (ping < 0) return 'dead';
  if (ping <= 85) return '';
  if (ping <= 180) return 'med';
  return 'low';
}

function updateMainScreenUI() {
  const active = getSelectedServer();
  const flagEl = document.getElementById('currentFlag');
  const countryEl = document.getElementById('currentCountry');
  const tagEl = document.getElementById('currentNodeTag');
  const cityEl = document.getElementById('currentCity');
  const pingPillEl = document.getElementById('currentPingPill');
  const pingTextEl = document.getElementById('currentPing');
  const signalBarsEl = document.getElementById('currentSignalBars');

  if (!active) {
    protocolLabel.textContent = 'NO KEY';
    flagEl.textContent = '＋';
    countryEl.textContent = 'Нет активного сервера';
    tagEl.style.display = 'none';
    cityEl.textContent = 'Нажмите, чтобы добавить ключ или подписку';
    pingPillEl.style.display = 'none';
    if (state === 'disconnected') {
      ipLabel.textContent = 'ДОБАВЬТЕ КЛЮЧ ДОСТУПА';
      powerHint.textContent = 'Нажмите + чтобы вставить ключ или подписку';
    }
    return;
  }

  protocolLabel.textContent = active.protocol;
  flagEl.textContent = active.flag;
  countryEl.textContent = active.name;
  tagEl.textContent = active.tag;
  tagEl.style.display = 'inline-block';
  cityEl.textContent = `${maskHost(active.host)} • Порт ${active.port}`;

  pingPillEl.style.display = 'inline-flex';
  signalBarsEl.className = `signal-bars ${getSignalClass(active.ping)}`;
  if (active.ping === null) {
    pingTextEl.textContent = 'PING';
  } else if (active.ping < 0) {
    pingTextEl.textContent = 'TIMEOUT';
  } else {
    pingTextEl.textContent = `${active.ping} ms`;
  }

  if (state === 'disconnected') {
    ipLabel.textContent = `${maskHost(active.host)} • READY`;
    powerHint.textContent = 'Коснитесь ядра для запуска туннеля';
  }
}

function formatTime(totalSec) {
  const hrs = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const secs = String(totalSec % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

function formatSpeed(bytesPerSec) {
  if (bytesPerSec >= 1024 * 1024) {
    return { value: (bytesPerSec / (1024 * 1024)).toFixed(1), unit: 'МБ/с' };
  }
  const kb = bytesPerSec / 1024;
  return { value: kb >= 100 ? kb.toFixed(0) : kb.toFixed(1), unit: 'КБ/с' };
}

function startTelemetry() {
  stopTelemetry();
  timerInterval = setInterval(() => {
    seconds++;
    timerEl.textContent = formatTime(seconds);
  }, 1000);

  const vpnBridge = getVpnBridge();
  if (vpnBridge && typeof vpnBridge.getTrafficStats === 'function') {
    trafficInterval = setInterval(async () => {
      try {
        const stats = await vpnBridge.getTrafficStats();
        const now = performance.now();

        if (lastRxBytes === null || lastTxBytes === null) {
          lastRxBytes = stats.rxBytes;
          lastTxBytes = stats.txBytes;
          lastStatsTime = now;
          return;
        }

        const dt = Math.max((now - lastStatsTime) / 1000, 0.2);
        const rxSpeed = Math.max(0, stats.rxBytes - lastRxBytes) / dt;
        const txSpeed = Math.max(0, stats.txBytes - lastTxBytes) / dt;

        lastRxBytes = stats.rxBytes;
        lastTxBytes = stats.txBytes;
        lastStatsTime = now;

        const rxFormatted = formatSpeed(rxSpeed);
        const txFormatted = formatSpeed(txSpeed);

        downSpeed.textContent = rxFormatted.value;
        downUnit.textContent = rxFormatted.unit;
        upSpeed.textContent = txFormatted.value;
        upUnit.textContent = txFormatted.unit;

        const totalKB = (rxSpeed + txSpeed) / 1024;
        targetWaveAmplitude = totalKB < 1 ? 1.6 : Math.min(11, 2 + Math.log10(totalKB + 1) * 2.8);
      } catch (_) {}
    }, 1000);
  }
}

function stopTelemetry() {
  clearInterval(timerInterval);
  clearInterval(trafficInterval);
  seconds = 0;
  lastRxBytes = null;
  lastTxBytes = null;
  lastStatsTime = 0;
  timerEl.textContent = '00:00:00';
  downSpeed.textContent = '0.0';
  downUnit.textContent = 'КБ/с';
  upSpeed.textContent = '0.0';
  upUnit.textContent = 'КБ/с';
  targetWaveAmplitude = 1.5;
}

async function setDisconnected(customHint) {
  clearTimeout(connectTimeout);
  state = 'disconnected';
  body.className = '';
  targetWarpSpeed = 1;
  scrambleText(statusText, 'ОЖИДАНИЕ КАНАЛА', 320);
  updateMainScreenUI();
  if (customHint) powerHint.textContent = customHint;
  stopTelemetry();

  const vpnBridge = getVpnBridge();
  if (vpnBridge) {
    try {
      await vpnBridge.disconnect();
    } catch (_) {}
  }
}

function applyConnectedUI(srv) {
  state = 'connected';
  body.className = 'connected';
  targetWarpSpeed = 6.2;
  scrambleText(statusText, 'ТУННЕЛЬ ЗАЩИЩЁН', 380);
  scrambleText(ipLabel, `${maskHost(srv.host)} • ${srv.tag}`, 420);
  powerHint.textContent = 'Шифрование активно • Нажмите для разрыва';
  fireShockwaves();
  vibrate([25, 45, 35]);
  startTelemetry();
}

async function startConnecting() {
  clearTimeout(connectTimeout);
  const srv = getSelectedServer();

  if (!srv) {
    openAddModal();
    return;
  }

  state = 'connecting';
  body.className = 'connecting';
  targetWarpSpeed = 3.2;
  targetWaveAmplitude = 4.5;
  scrambleText(statusText, 'ПОДКЛЮЧЕНИЕ...', 300);
  powerHint.textContent = `Маршрутизация: ${srv.name}...`;

  const vpnBridge = getVpnBridge();
  if (vpnBridge) {
    try {
      await vpnBridge.connect({ uri: srv.uri });
      applyConnectedUI(srv);
    } catch (err) {
      await setDisconnected(`Ошибка запуска: ${err.message || 'проверь ключ'}`);
    }
  } else {
    connectTimeout = setTimeout(() => applyConnectedUI(srv), 900);
  }
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

/* === 7. ШТОРКА СЕРВЕРОВ И ПРОВЕРКА ПИНГА === */
const openServersBtn = document.getElementById('openServersBtn');
const closeSheetBtn = document.getElementById('closeSheetBtn');
const sheetOverlay = document.getElementById('sheetOverlay');
const bottomSheet = document.getElementById('bottomSheet');
const serverListEl = document.getElementById('serverList');
const serverCountLabel = document.getElementById('serverCountLabel');
const pingAllBtn = document.getElementById('pingAllBtn');
const updateSubsBtn = document.getElementById('updateSubsBtn');
const sheetAddBtn = document.getElementById('sheetAddBtn');
const subInfoCard = document.getElementById('subInfoCard');
const deleteSubBtn = document.getElementById('deleteSubBtn');

function renderServerSheet() {
  serverCountLabel.textContent = `${servers.length} ${servers.length === 1 ? 'конфигурация' : 'конфигураций'}`;

  if (subscriptionMeta) {
    subInfoCard.style.display = 'block';
    updateSubsBtn.style.display = 'inline-flex';
    document.getElementById('subProfileName').textContent = subscriptionMeta.profileName;
    document.getElementById('subTrafficText').textContent = subscriptionMeta.trafficText;
    document.getElementById('subExpireText').textContent = subscriptionMeta.expireText;
  } else {
    subInfoCard.style.display = 'none';
    updateSubsBtn.style.display = 'none';
  }

  if (servers.length === 0) {
    serverListEl.innerHTML = `
      <div class="empty-state">
        <p>Список серверов пуст.<br>Вставьте ссылку подписки или ключ доступа vless://</p>
        <button class="clipboard-btn" id="emptyAddTrigger">＋ ДОБАВИТЬ КЛЮЧ</button>
      </div>
    `;
    document.getElementById('emptyAddTrigger').addEventListener('click', () => {
      closeSheet();
      openAddModal();
    });
    return;
  }

  serverListEl.innerHTML = servers.map(srv => {
    const isSelected = srv.id === selectedServerId;
    const pingText = srv.ping === null ? '•••' : (srv.ping < 0 ? 'ERR' : `${srv.ping} ms`);
    const sigClass = getSignalClass(srv.ping);

    return `
      <div class="server-option ${isSelected ? 'active' : ''}" data-id="${srv.id}">
        <div class="server-left">
          <div class="flag-box">
            <span class="flag-emoji">${srv.flag}</span>
          </div>
          <div class="server-meta">
            <div class="server-title-row">
              <span class="server-country">${srv.name}</span>
              <span class="node-tag">${srv.tag}</span>
            </div>
            <span class="server-city">${maskHost(srv.host)}:${srv.port}</span>
          </div>
        </div>

        <div class="server-opt-right">
          <div class="ping-pill" data-ping-id="${srv.id}" title="Нажмите для замера пинга">
            <span class="signal-bars ${sigClass}"><i></i><i></i><i></i></span>
            <span>${pingText}</span>
          </div>
          <button class="mini-btn" data-rename-id="${srv.id}" title="Переименовать">✎</button>
          <button class="mini-btn" data-del-id="${srv.id}" title="Удалить">✕</button>
        </div>
      </div>
    `;
  }).join('');

  // Выбор сервера
  serverListEl.querySelectorAll('.server-option').forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('[data-ping-id]')) return;
      vibrate(20);
      selectedServerId = row.dataset.id;
      saveStorage();
      updateMainScreenUI();
      renderServerSheet();
      closeSheet();

      if (state === 'connected') {
        stopTelemetry();
        startConnecting();
      }
    });
  });

  // Пинг одного сервера
  serverListEl.querySelectorAll('[data-ping-id]').forEach(pill => {
    pill.addEventListener('click', async (e) => {
      e.stopPropagation();
      const srv = servers.find(s => s.id === pill.dataset.pingId);
      if (!srv) return;
      pill.querySelector('span:last-child').textContent = '...';
      await pingSingleServer(srv);
      saveStorage();
      renderServerSheet();
      updateMainScreenUI();
    });
  });

  // Переименование сервера
  serverListEl.querySelectorAll('[data-rename-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const srv = servers.find(s => s.id === btn.dataset.renameId);
      if (!srv) return;
      const newName = prompt('Новое название сервера:', srv.name);
      if (newName && newName.trim()) {
        srv.name = newName.trim();
        saveStorage();
        renderServerSheet();
        updateMainScreenUI();
      }
    });
  });

  // Удаление сервера
  serverListEl.querySelectorAll('[data-del-id]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const delId = btn.dataset.delId;
      servers = servers.filter(s => s.id !== delId);
      if (selectedServerId === delId) {
        selectedServerId = servers[0] ? servers[0].id : null;
        if (state === 'connected') await setDisconnected();
      }
      saveStorage();
      renderServerSheet();
      updateMainScreenUI();
    });
  });
}

async function pingAllServers() {
  if (servers.length === 0) return;
  pingAllBtn.classList.add('spinning');
  await Promise.all(servers.map(s => pingSingleServer(s)));
  pingAllBtn.classList.remove('spinning');
  saveStorage();
  renderServerSheet();
  updateMainScreenUI();
}

pingAllBtn.addEventListener('click', pingAllServers);

updateSubsBtn.addEventListener('click', async () => {
  if (!subscriptionMeta || !subscriptionMeta.url) return;
  updateSubsBtn.classList.add('spinning');
  try {
    await importPayload(subscriptionMeta.url, true);
  } finally {
    updateSubsBtn.classList.remove('spinning');
  }
});

deleteSubBtn.addEventListener('click', async () => {
  servers = servers.filter(s => s.source !== 'sub');
  subscriptionMeta = null;
  selectedServerId = servers[0] ? servers[0].id : null;
  if (!selectedServerId && state === 'connected') await setDisconnected();
  saveStorage();
  renderServerSheet();
  updateMainScreenUI();
});

function openSheet() {
  vibrate(15);
  renderServerSheet();
  sheetOverlay.classList.add('open');
  bottomSheet.classList.add('open');
}

function closeSheet() {
  sheetOverlay.classList.remove('open');
  bottomSheet.classList.remove('open');
}

openServersBtn.addEventListener('click', () => {
  if (servers.length === 0) {
    openAddModal();
  } else {
    openSheet();
  }
});
closeSheetBtn.addEventListener('click', closeSheet);
sheetOverlay.addEventListener('click', closeSheet);
sheetAddBtn.addEventListener('click', () => {
  closeSheet();
  openAddModal();
});

/* === 8. МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ КЛЮЧА / ПОДПИСКИ === */
const openAddModalBtn = document.getElementById('openAddModalBtn');
const closeAddModalBtn = document.getElementById('closeAddModalBtn');
const addModalOverlay = document.getElementById('addModalOverlay');
const addModal = document.getElementById('addModal');
const pasteClipboardBtn = document.getElementById('pasteClipboardBtn');
const manualKeyInput = document.getElementById('manualKeyInput');
const confirmAddBtn = document.getElementById('confirmAddBtn');
const addModalStatus = document.getElementById('addModalStatus');

function openAddModal() {
  vibrate(15);
  manualKeyInput.value = '';
  addModalStatus.textContent = '';
  addModalOverlay.classList.add('open');
  addModal.classList.add('open');
}

function closeAddModal() {
  addModalOverlay.classList.remove('open');
  addModal.classList.remove('open');
}

async function importPayload(rawInput, isSubRefresh = false) {
  const text = (rawInput || '').trim();
  if (!text) {
    addModalStatus.textContent = 'Буфер или поле ввода пусты';
    return false;
  }

  // Если вставлена ссылка подписки https://...
  if (/^https?:\/\/\S+$/i.test(text)) {
    addModalStatus.textContent = 'Загрузка подписки с сервера...';
    try {
      const { body, headers } = await fetchSubscriptionRemote(text);
      const parsed = parseMultiPayload(body, 'sub');
      if (parsed.length === 0) {
        addModalStatus.textContent = 'В подписке не найдено рабочих ключей';
        return false;
      }

      subscriptionMeta = parseSubscriptionHeaders(text, headers || {});
      const manualOnly = servers.filter(s => s.source !== 'sub');
      servers = [...parsed, ...manualOnly];
      if (!selectedServerId || !servers.some(s => s.id === selectedServerId)) {
        selectedServerId = servers[0].id;
      }

      saveStorage();
      updateMainScreenUI();
      if (!isSubRefresh) closeAddModal();
      renderServerSheet();
      pingAllServers();
      return true;
    } catch (err) {
      addModalStatus.textContent = `Ошибка загрузки подписки: ${err.message}`;
      return false;
    }
  }

  // Прямой ключ vless://, trojan:// или WireGuard
  const added = parseMultiPayload(text, 'manual');
  if (added.length === 0) {
    addModalStatus.textContent = 'Неверный формат ключа (нужен vless://, trojan:// или https://)';
    return false;
  }

  servers = [...added, ...servers];
  selectedServerId = added[0].id;
  saveStorage();
  updateMainScreenUI();
  closeAddModal();
  openSheet();
  pingAllServers();
  return true;
}

pasteClipboardBtn.addEventListener('click', async () => {
  vibrate(20);
  try {
    const bridge = getVpnBridge();
    let clipText = '';
    if (bridge && typeof bridge.readClipboard === 'function') {
      clipText = await bridge.readClipboard();
    } else if (navigator.clipboard && navigator.clipboard.readText) {
      clipText = await navigator.clipboard.readText();
    }
    manualKeyInput.value = clipText;
    await importPayload(clipText);
  } catch (_) {
    addModalStatus.textContent = 'Нет доступа к буферу — вставьте ключ в поле ниже вручную';
  }
});

confirmAddBtn.addEventListener('click', () => {
  importPayload(manualKeyInput.value);
});

openAddModalBtn.addEventListener('click', openAddModal);
closeAddModalBtn.addEventListener('click', closeAddModal);
addModalOverlay.addEventListener('click', closeAddModal);

// Инициализация при запуске приложения
loadStorage();
updateMainScreenUI();
