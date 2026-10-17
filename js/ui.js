// Small DOM helpers shared by every screen.

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value == null || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key === 'html') el.innerHTML = value;
    else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'style' && typeof value === 'object') {
      for (const [prop, v] of Object.entries(value)) {
        if (prop.startsWith('--')) el.style.setProperty(prop, v);
        else el.style[prop] = v;
      }
    }
    else el.setAttribute(key, value === true ? '' : value);
  }
  add(el, children);
  return el;
}

// Like Element.append, but skips null/false so conditional children are easy.
export function add(el, ...children) {
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

export function clear(el) {
  while (el.firstChild) el.firstChild.remove();
  return el;
}

export function img(name, { alt = '', cls = 'pic' } = {}) {
  return h('img', { src: `assets/img/${name}.webp`, alt, class: cls, loading: 'lazy', draggable: 'false' });
}

// Picture with an optional repeat count ("three books").
export function picture(spec, cls = 'pic') {
  if (!spec) return null;
  if (typeof spec === 'string') return img(spec, { cls });
  const count = spec.count || 1;
  return h('span', { class: `pic-group ${cls}` }, Array.from({ length: count }, () => img(spec.img, { cls: 'pic-small' })));
}

export function stars(n, max = 3) {
  return h('span', { class: 'stars', 'aria-label': `${n} of ${max} stars` },
    Array.from({ length: max }, (_, i) => h('span', { class: i < n ? 'star on' : 'star' }, '★')));
}

// Renders inline **bold** text from content strings.
export function rich(text) {
  const parts = String(text ?? '').split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p) => (p.startsWith('**') && p.endsWith('**') ? h('strong', {}, p.slice(2, -2)) : p));
}

let toastTimer;
export function toast(message, kind = 'info') {
  let el = document.getElementById('toast');
  if (!el) {
    el = h('div', { id: 'toast', role: 'status', 'aria-live': 'polite' });
    document.body.append(el);
  }
  el.textContent = message;
  el.className = `show ${kind}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = ''; }, 3200);
}

export function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = h('div', { class: 'confetti', 'aria-hidden': 'true' });
  const colors = ['#ff6b6b', '#ffd93d', '#6bcB77', '#4d96ff', '#c77dff', '#ff9f43'];
  for (let i = 0; i < 60; i++) {
    box.append(h('i', {
      style: {
        left: `${Math.random() * 100}%`,
        background: colors[i % colors.length],
        animationDelay: `${Math.random() * 0.6}s`,
        animationDuration: `${1.6 + Math.random() * 1.4}s`,
        transform: `rotate(${Math.random() * 360}deg)`,
      },
    }));
  }
  document.body.append(box);
  setTimeout(() => box.remove(), 3500);
}

export function shuffle(list, seed = 1) {
  // Deterministic shuffle so the order stays the same when a child resumes.
  const out = [...list];
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function hashString(text) {
  let hsh = 7;
  for (const ch of String(text)) hsh = (hsh * 31 + ch.charCodeAt(0)) % 100000;
  return hsh || 1;
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
