/* Plain JavaScript, no dependencies. Change these values to remix the game. */
'use strict';
const ROUND_SECONDS = 30;
const STARTING_LIVES = 5;
const $ = (id) => document.getElementById(id);
const icons = { bug: '🐛', coffee: '☕', duck: '🦆' };
let state = 'ready';
let score = 0, lives = STARTING_LIVES, streak = 0, remaining = ROUND_SECONDS;
let target = null, targetRemaining = 0, spawnDelay = 0, elapsed = 0;
let practice = false, previousFrame = 0, best = 0;
// Storage can be unavailable in private browsing or when opening a local file.
try { best = Math.max(0, Number(localStorage.getItem('bug-bash-best')) || 0); } catch (_) {}
const cells = Array.from({ length: 9 }, (_, index) => {
  const button = document.createElement('button');
  button.className = 'cell';
  button.type = 'button';
  button.innerHTML = `<span class="key" aria-hidden="true">${index + 1}</span><span class="sprite" aria-hidden="true"></span>`;
  button.addEventListener('click', () => hit(index));
  $('board').append(button);
  return button;
});

function multiplier() { return Math.min(3, 1 + Math.floor(streak / 5)); }
function render() {
  $('score').textContent = String(score).padStart(4, '0');
  $('best').textContent = String(best).padStart(4, '0');
  $('time').textContent = practice ? '∞' : Math.ceil(remaining);
  $('time-label').textContent = practice ? 'NO TIMER' : 'SECONDS';
  $('health').textContent = practice ? '∞' : '●'.repeat(lives) + '○'.repeat(STARTING_LIVES - lives);
  $('health').setAttribute('aria-label', practice ? 'Unlimited lives' : `${lives} of ${STARTING_LIVES} lives`);
  $('combo').textContent = `STREAK ${streak} · ×${multiplier()}`;
  $('mode-label').textContent = state === 'running' ? (practice ? 'PRACTICE' : 'LIVE') : state.toUpperCase();
  $('pause').disabled = state !== 'running' && state !== 'paused';
  $('pause').textContent = state === 'paused' ? 'Resume' : 'Pause';
  $('finish').disabled = state !== 'running' && state !== 'paused';
  $('practice').disabled = state === 'running' || state === 'paused';
  cells.forEach((cell, index) => {
    const active = target && target.index === index && state === 'running';
    cell.dataset.kind = active ? target.kind : '';
    cell.querySelector('.sprite').textContent = active ? icons[target.kind] : '';
    cell.setAttribute('aria-label', `Square ${index + 1}: ${active ? target.kind : 'empty'}`);
    cell.disabled = state !== 'running';
  });
}

function announce(message) { $('status').textContent = message; }
function start() {
  if (state === 'paused') { togglePause(); return; }
  if (state === 'running') return;
  practice = $('practice').checked;
  score = 0; streak = 0; lives = STARTING_LIVES;
  remaining = ROUND_SECONDS; elapsed = 0; target = null; spawnDelay = 0;
  state = 'running'; previousFrame = performance.now();
  $('overlay').hidden = true;
  announce('Deployment started. What could go wrong?');
  spawn(); render(); cells[0].focus({ preventScroll: true });
}

function spawn() {
  const roll = Math.random();
  target = { index: Math.floor(Math.random() * 9), kind: roll < .7 ? 'bug' : roll < .85 ? 'coffee' : 'duck' };
  targetRemaining = practice ? 2200 : Math.max(650, 1400 - elapsed * 12);
  render();
}

function clearTarget() { target = null; spawnDelay = 180; render(); }
function hit(index) {
  if (state !== 'running' || !target || target.index !== index) return;
  if (target.kind === 'bug') {
    const points = 10 * multiplier();
    score += points; streak += 1;
    announce(`+${points} · Bug fixed. Ship it.`);
  } else if (target.kind === 'coffee') {
    if (practice) { score += 5; announce('+5 · Coffee dependency resolved.'); }
    else { const added = Math.min(3, 45 - remaining); remaining += added; announce(`+${added.toFixed(1).replace('.0', '')}s · Coffee dependency resolved.`); }
  } else {
    score = Math.max(0, score - 15); streak = 0;
    if (!practice) lives -= 1;
    announce('Duck offended. Debugging privileges revoked.');
  }
  clearTarget();
  if (lives <= 0) finish('The build is broken.');
}

function finish(title) {
  if (state !== 'running' && state !== 'paused') return;
  state = 'finished'; target = null;
  const isBest = !practice && score > best;
  if (isBest) {
    best = score;
    try { localStorage.setItem('bug-bash-best', String(best)); } catch (_) {}
  }
  $('overlay-kicker').textContent = practice ? 'PRACTICE COMPLETE' : isBest ? 'NEW PERSONAL BEST' : 'DEPLOYMENT REPORT';
  $('overlay-title').textContent = title;
  const verdict = score >= 300 ? 'Senior bug whisperer.' : score >= 150 ? 'Suspiciously competent.' : score > 0 ? 'It works on your machine.' : 'Have you tried turning it off and on?';
  $('overlay-copy').textContent = `${score} points. ${verdict}${practice ? ' Practice scores stay separate from your best run.' : ''}`;
  $('start').textContent = 'Deploy again ↗';
  $('overlay').hidden = false;
  render(); $('start').focus({ preventScroll: true });
}

function togglePause() {
  if (state === 'running') {
    state = 'paused';
    $('overlay-kicker').textContent = 'BRB. THINKING ABOUT SEMICOLONS.';
    $('overlay-title').textContent = 'Chaos on hold.';
    $('overlay-copy').textContent = 'Your timer and targets are paused. Take your time.';
    $('start').textContent = 'Resume the chaos ↗';
    $('overlay').hidden = false;
    render(); $('start').focus({ preventScroll: true });
  } else if (state === 'paused') {
    state = 'running'; previousFrame = performance.now();
    $('overlay').hidden = true;
    render(); cells[0].focus({ preventScroll: true });
  }
}

// A single clock drives both the round and the target lifetime.
function frame(now) {
  const delta = Math.max(0, now - previousFrame);
  previousFrame = now;
  if (state === 'running') {
    elapsed += delta / 1000;
    if (!practice) remaining = Math.max(0, remaining - delta / 1000);
    if (!practice && remaining === 0) finish('Friday survived.');
    else if (target) {
      targetRemaining -= delta;
      if (targetRemaining <= 0) {
        if (target.kind === 'bug') {
          streak = 0;
          if (!practice) lives -= 1;
          announce(practice ? 'Bug escaped. Another one is on its way.' : 'Bug escaped into production.');
        }
        clearTarget();
        if (lives <= 0) finish('The build is broken.');
      }
    } else {
      spawnDelay -= delta;
      if (spawnDelay <= 0) spawn();
    }
    // Update the countdown without rebuilding the board on every frame.
    $('time').textContent = practice ? '∞' : Math.ceil(remaining);
  }
  requestAnimationFrame(frame);
}

$('start').addEventListener('click', start);
$('pause').addEventListener('click', togglePause);
$('finish').addEventListener('click', () => finish('Run complete.'));
$('practice').addEventListener('change', () => {
  practice = $('practice').checked;
  render();
});
document.addEventListener('keydown', (event) => {
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.target.matches('input, textarea, select')) return;
  if (/^[1-9]$/.test(event.key) && state === 'running') { event.preventDefault(); hit(Number(event.key) - 1); }
  if (event.key.toLowerCase() === 'p' && (state === 'running' || state === 'paused')) { event.preventDefault(); togglePause(); }
  if (event.key === 'Enter' && (state === 'ready' || state === 'finished' || state === 'paused')) { event.preventDefault(); start(); }
});
document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'running') togglePause(); });
window.addEventListener('blur', () => { if (state === 'running') togglePause(); });
render(); requestAnimationFrame(frame);
