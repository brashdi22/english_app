// Pages for the family: signing in, choosing who is learning (with a PIN),
// the parent area, a child's progress, and the family scoreboard.

import { h, add, clear, img, stars, toast, formatTime } from './ui.js';
import { BOOK } from './content/index.js';
import * as P from './progress.js';
import { validPin } from './accounts.js';

export function familyPages(ctx) {
  const { store, family, main, go, renderHeader, AVATARS, fmt } = ctx;

  const children = () => Object.values(store.state.profiles).sort((a, b) => a.name.localeCompare(b.name));

  // ---------------------------------------------------------------- loading
  function loadingPage() {
    renderHeader();
    add(main, h('section', { class: 'card center' }, h('p', {}, '⏳ Getting your family ready…')));
  }

  // ------------------------------------------------------- family sign-in
  function signInPage(tab = 'signin') {
    renderHeader();
    const email = h('input', { type: 'email', class: 'write-input', placeholder: 'Email', autocomplete: 'username', 'aria-label': 'Email' });
    const password = h('input', { type: 'password', class: 'write-input', placeholder: 'Password', autocomplete: tab === 'signin' ? 'current-password' : 'new-password', 'aria-label': 'Password' });
    const confirm = h('input', { type: 'password', class: 'write-input', placeholder: 'Password again', autocomplete: 'new-password', 'aria-label': 'Password again' });
    const status = h('p', { class: 'form-status', role: 'status', 'aria-live': 'polite' });
    const submit = h('button', { type: 'submit', class: 'btn primary big' }, tab === 'signin' ? 'Sign in' : 'Create family account');

    const form = h('form', {
      class: 'auth-form',
      onsubmit: async (e) => {
        e.preventDefault();
        status.textContent = '';
        if (tab === 'signup' && password.value !== confirm.value) {
          status.textContent = 'The two passwords are not the same.';
          return;
        }
        submit.disabled = true;
        status.textContent = tab === 'signin' ? 'Signing in…' : 'Creating your family account…';
        try {
          if (tab === 'signin') {
            await family.signIn(email.value, password.value);
          } else {
            await family.signUp(email.value, password.value);
            ctx.setAdult(true);
            location.hash = '#/parent';
          }
        } catch (err) {
          status.textContent = family.errorMessage(err);
          submit.disabled = false;
        }
      },
    }, email, password, tab === 'signup' ? confirm : null, submit, status);

    add(main,
      h('section', { class: 'hero small' }, img('cover', { cls: 'cover', alt: '' }),
        h('div', { class: 'hero-text' }, h('h2', {}, BOOK.title),
          h('p', {}, 'One family account for all your children. A grown-up signs in once on each device the children use; then each child logs in with their picture and PIN.'))),
      h('section', { class: 'card' },
        h('div', { class: 'tabs' },
          h('button', { type: 'button', class: `tab ${tab === 'signin' ? 'on' : ''}`, onclick: () => { clear(main); signInPage('signin'); } }, 'Sign in'),
          h('button', { type: 'button', class: `tab ${tab === 'signup' ? 'on' : ''}`, onclick: () => { clear(main); signInPage('signup'); } }, 'New family account')),
        h('h2', {}, tab === 'signin' ? '👪 Sign in to your family' : '👪 Create a family account'),
        form,
        tab === 'signin' ? h('button', {
          type: 'button', class: 'btn small ghost',
          onclick: async () => {
            if (!email.value.trim()) { status.textContent = 'Write your email first, then tap "Forgot password?" again.'; return; }
            try {
              await family.resetPassword(email.value);
              status.textContent = 'We sent you an email to choose a new password.';
            } catch (err) {
              status.textContent = family.errorMessage(err);
            }
          },
        }, 'Forgot password?') : h('p', { class: 'small muted' }, 'The parent password for the parent area and grown-up scoring starts as the one in the instructions; you can change it in the parent area.')));
    email.focus();
  }

  // ------------------------------------------------- who is learning?
  function pickerPage() {
    renderHeader('Who is learning?');
    const kids = children();
    const grid = h('div', { class: 'profile-list' });
    for (const child of kids) {
      add(grid, h('button', { type: 'button', class: 'profile-pick', onclick: () => childLogin(child) },
        img(child.avatar, { cls: 'avatar big' }), h('span', {}, child.name)));
    }
    add(main,
      h('section', { class: 'hero small' }, img('cover', { cls: 'cover', alt: '' }),
        h('div', { class: 'hero-text' }, h('h2', {}, BOOK.title), h('p', {}, 'Tap your picture to start.'))),
      kids.length
        ? h('section', { class: 'card' }, h('h2', {}, '👋 Who is learning?'), grid)
        : h('section', { class: 'card' }, h('h2', {}, '👋 Welcome!'),
          h('p', {}, 'A grown-up needs to add the children first.'),
          h('button', { type: 'button', class: 'btn primary big', onclick: () => go('#/parent') }, '👪 Grown-up: add children')),
      h('div', { class: 'controls' },
        kids.length > 1 ? h('button', { type: 'button', class: 'btn ghost', onclick: () => go('#/scoreboard') }, '🏆 Scoreboard') : null,
        h('button', { type: 'button', class: 'btn ghost', onclick: () => go('#/parent') }, '👪 Parent area')));
  }

  async function childLogin(child) {
    if (!child.pinHash) {
      await family.loginChild(child.id, '');
      ctx.speak(`Hello, ${child.name}!`);
      go('#/');
      return;
    }
    pinPad(child);
  }

  function pinPad(child) {
    let pin = '';
    const dots = h('div', { class: 'pin-dots', 'aria-label': 'PIN' });
    const msg = h('p', { class: 'pin-msg', role: 'status', 'aria-live': 'polite' }, 'Type your PIN');
    const draw = () => {
      clear(dots);
      for (let i = 0; i < 4; i++) add(dots, h('span', { class: `pin-dot ${i < pin.length ? 'on' : ''}` }));
    };
    const press = async (key) => {
      if (key === 'del') pin = pin.slice(0, -1);
      else if (pin.length < 4) pin += key;
      draw();
      if (pin.length === 4) {
        const ok = await family.loginChild(child.id, pin);
        if (ok) {
          dialog.close();
          ctx.speak(`Hello, ${child.name}!`);
          go('#/');
        } else {
          dialog.querySelector('.pin-box').classList.remove('shake');
          void dialog.offsetWidth;
          dialog.querySelector('.pin-box').classList.add('shake');
          msg.textContent = "That's not your PIN. Try again!";
          pin = '';
          draw();
        }
      }
    };
    const keys = h('div', { class: 'pin-keys' },
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0'].map((k) => h('button', {
        type: 'button', class: 'pin-key', 'aria-label': k === 'del' ? 'Delete' : k, onclick: () => press(k),
      }, k === 'del' ? '⌫' : k)));
    const dialog = h('dialog', { class: 'modal pin-modal' },
      h('div', { class: 'pin-box' }, img(child.avatar, { cls: 'avatar big' }), h('h2', {}, child.name), msg, dots, keys,
        h('button', { type: 'button', class: 'btn ghost', onclick: () => dialog.close() }, 'Cancel')));
    dialog.addEventListener('keydown', (e) => {
      if (/^\d$/.test(e.key)) press(e.key);
      if (e.key === 'Backspace') press('del');
    });
    dialog.addEventListener('close', () => dialog.remove());
    add(document.body, dialog);
    draw();
    dialog.showModal();
  }

  // ------------------------------------------------------------ parent area
  function passwordGate(onOpen) {
    const input = h('input', { type: 'password', class: 'write-input', placeholder: 'Parent password', autocomplete: 'current-password', 'aria-label': 'Parent password' });
    const status = h('p', { class: 'form-status', role: 'status', 'aria-live': 'polite' });
    add(main, h('section', { class: 'card narrow' },
      h('h2', {}, '🔒 Parent area'),
      h('p', {}, 'Please enter the parent password.'),
      h('form', {
        class: 'auth-form',
        onsubmit: async (e) => {
          e.preventDefault();
          if (await family.checkParent(input.value)) {
            ctx.setAdult(true);
            onOpen();
          } else {
            status.textContent = 'That password is not right.';
            input.value = '';
            input.focus();
          }
        },
      }, input, h('button', { type: 'submit', class: 'btn primary' }, 'Open'), status)));
    input.focus();
  }

  function parentPage() {
    renderHeader('Parent area');
    if (!ctx.isAdult()) return passwordGate(() => { clear(main); parentPage(); });
    family.watchAllProgress();
    const kids = children();

    // Family
    const familyCard = h('section', { class: 'card' }, h('h2', {}, '👪 Family'));
    if (family.mode === 'cloud') {
      add(familyCard,
        h('p', {}, 'Signed in as ', h('strong', {}, family.user?.email || ''), '. Progress is shared between all devices signed in to this family.'),
        h('button', {
          type: 'button', class: 'btn ghost',
          onclick: async () => {
            if (!confirm('Sign this device out of the family? The children will not be able to use it until you sign in again.')) return;
            ctx.setAdult(false);
            await family.signOut();
            go('#/');
          },
        }, 'Sign this device out'));
      const learners = family.localLearners();
      if (learners.length) {
        add(familyCard, h('div', { class: 'note' }, h('span', { class: 'note-icon' }, '📥'), h('div', {},
          h('p', {}, `This device has progress saved before the family account: ${learners.map((l) => l.name).join(', ')}.`),
          h('button', {
            type: 'button', class: 'btn primary small',
            onclick: () => { const n = family.importLocalLearners(); toast(`${n} learner${n === 1 ? '' : 's'} added to the family.`, 'good'); clear(main); parentPage(); },
          }, 'Add them to the family'))));
      }
    } else {
      add(familyCard, h('p', {}, 'Progress is saved on this device only. To let the children use several devices and see their progress from your phone, set up family accounts (see "Family accounts" in the README).'));
    }

    // Children
    const list = h('div', { class: 'child-cards' });
    for (const child of kids) add(list, childCard(child));
    const childrenCard = h('section', { class: 'card' }, h('h2', {}, '🧒 Children'),
      kids.length ? list : h('p', { class: 'muted' }, 'No children yet. Add them below.'));

    add(main, familyCard, childrenCard, addChildCard(), passwordCard(), backupCard(),
      h('div', { class: 'controls' },
        h('button', { type: 'button', class: 'btn ghost', onclick: () => go('#/scoreboard') }, '🏆 Scoreboard'),
        h('button', { type: 'button', class: 'btn primary', onclick: () => { ctx.setAdult(false); go('#/'); } }, 'Close the parent area')));
  }

  function childCard(child) {
    const s = P.summaryFor(child);
    const current = Object.entries(s.units).find(([, u]) => u.done < u.total);
    const unitLabel = current ? P.UNITS.find((u) => u.id === current[0])?.label : 'All done!';
    return h('div', { class: 'child-card' },
      h('div', { class: 'child-head' }, img(child.avatar, { cls: 'avatar big' }),
        h('div', {}, h('h3', {}, child.name),
          h('p', { class: 'small muted' }, s.lastActive ? `Last practised ${timeAgo(s.lastActive)}` : 'Not started yet'))),
      h('div', { class: 'stat-row' },
        stat('⭐', s.stars, 'stars'),
        stat('✅', `${s.done}/${s.total}`, 'activities'),
        stat('📝', s.reviewPercent == null ? '–' : `${s.reviewPercent}%`, 'reviews'),
        stat('📖', unitLabel, 'working on')),
      h('div', { class: 'controls left' },
        h('button', { type: 'button', class: 'btn small primary', onclick: () => go(`#/parent/child/${child.id}`) }, '📊 Progress'),
        h('button', { type: 'button', class: 'btn small ghost', onclick: () => editChild(child) }, '✏️ Edit'),
        h('button', { type: 'button', class: 'btn small ghost', onclick: () => setPinDialog(child) }, '🔢 PIN'),
        h('button', {
          type: 'button', class: 'btn small ghost',
          onclick: () => {
            if (!confirm(`Start ${child.name}'s book again? All progress and scores will be deleted.`)) return;
            store.resetProgress(child.id);
            toast('Progress reset.', 'good');
            clear(main); parentPage();
          },
        }, '🔁 Reset'),
        h('button', {
          type: 'button', class: 'btn small danger',
          onclick: () => {
            if (!confirm(`Remove ${child.name} and all their progress from the family? This cannot be undone.`)) return;
            store.deleteProfile(child.id);
            clear(main); parentPage();
          },
        }, '🗑 Remove')));
  }

  function stat(icon, value, label) {
    return h('div', { class: 'stat' }, h('span', { class: 'stat-icon' }, icon), h('strong', {}, String(value)), h('span', { class: 'small muted' }, label));
  }

  function avatarPicker(selected, onPick) {
    const row = h('div', { class: 'avatar-row' });
    const draw = () => {
      clear(row);
      AVATARS.forEach((a) => add(row, h('button', {
        type: 'button', class: `avatar-pick ${a === selected ? 'selected' : ''}`, 'aria-label': a,
        onclick: () => { selected = a; onPick(a); draw(); },
      }, img(a, { cls: 'avatar' }))));
    };
    draw();
    return row;
  }

  function addChildCard() {
    let avatar = AVATARS[children().length % AVATARS.length];
    const name = h('input', { type: 'text', class: 'write-input', placeholder: "Child's name", maxlength: '30', 'aria-label': "Child's name" });
    const pin = h('input', { type: 'text', inputmode: 'numeric', class: 'write-input pin-input', placeholder: '4-digit PIN', maxlength: '4', autocomplete: 'off', 'aria-label': 'PIN' });
    const status = h('p', { class: 'form-status', role: 'status' });
    return h('section', { class: 'card' },
      h('h2', {}, '➕ Add a child'),
      h('form', {
        class: 'auth-form',
        onsubmit: async (e) => {
          e.preventDefault();
          if (!name.value.trim()) { status.textContent = 'Write the child’s name.'; return; }
          if (!validPin(pin.value)) { status.textContent = 'The PIN must be 4 numbers, for example 2580.'; return; }
          await family.addChild(name.value.trim(), avatar, pin.value);
          toast(`${name.value.trim()} was added. Their PIN is ${pin.value}.`, 'good');
          clear(main); parentPage();
        },
      }, name, h('p', { class: 'small' }, 'Picture:'), avatarPicker(avatar, (a) => { avatar = a; }),
      h('p', { class: 'small' }, 'PIN (the child types it to log in):'), pin,
      h('button', { type: 'submit', class: 'btn primary' }, 'Add child'), status));
  }

  function editChild(child) {
    let avatar = child.avatar;
    const name = h('input', { type: 'text', class: 'write-input', value: child.name, maxlength: '30', 'aria-label': 'Name' });
    const dialog = h('dialog', { class: 'modal' },
      h('h2', {}, `✏️ ${child.name}`), name, avatarPicker(avatar, (a) => { avatar = a; }),
      h('div', { class: 'controls' },
        h('button', { type: 'button', class: 'btn ghost', onclick: () => dialog.close() }, 'Cancel'),
        h('button', {
          type: 'button', class: 'btn primary',
          onclick: () => {
            store.updateProfile(child.id, (p) => { p.name = name.value.trim() || p.name; p.avatar = avatar; });
            dialog.close();
            clear(main); parentPage();
          },
        }, 'Save')));
    dialog.addEventListener('close', () => dialog.remove());
    add(document.body, dialog);
    dialog.showModal();
  }

  function setPinDialog(child) {
    const pin = h('input', { type: 'text', inputmode: 'numeric', class: 'write-input pin-input', placeholder: 'New 4-digit PIN', maxlength: '4', autocomplete: 'off', 'aria-label': 'New PIN' });
    const status = h('p', { class: 'form-status' });
    const dialog = h('dialog', { class: 'modal' },
      h('h2', {}, `🔢 ${child.name}'s PIN`), pin, status,
      h('div', { class: 'controls' },
        h('button', { type: 'button', class: 'btn ghost', onclick: () => dialog.close() }, 'Cancel'),
        h('button', {
          type: 'button', class: 'btn primary',
          onclick: async () => {
            if (!validPin(pin.value)) { status.textContent = 'The PIN must be 4 numbers.'; return; }
            await family.setPin(child.id, pin.value);
            toast(`${child.name}'s new PIN is ${pin.value}.`, 'good');
            dialog.close();
          },
        }, 'Save')));
    dialog.addEventListener('close', () => dialog.remove());
    add(document.body, dialog);
    dialog.showModal();
    pin.focus();
  }

  function passwordCard() {
    const pw = h('input', { type: 'password', class: 'write-input', placeholder: 'New parent password', autocomplete: 'new-password', 'aria-label': 'New parent password' });
    const again = h('input', { type: 'password', class: 'write-input', placeholder: 'New password again', autocomplete: 'new-password', 'aria-label': 'New password again' });
    const status = h('p', { class: 'form-status', role: 'status' });
    return h('section', { class: 'card' },
      h('h2', {}, '🔑 Parent password'),
      h('p', { class: 'small muted' }, 'This password opens the parent area and grown-up scoring on every device of the family.'),
      h('form', {
        class: 'auth-form',
        onsubmit: async (e) => {
          e.preventDefault();
          if (pw.value.trim().length < 6) { status.textContent = 'Please use at least 6 characters.'; return; }
          if (pw.value !== again.value) { status.textContent = 'The two passwords are not the same.'; return; }
          try {
            await family.setParentPassword(pw.value);
            pw.value = '';
            again.value = '';
            status.textContent = '✓ The parent password was changed.';
          } catch (err) {
            status.textContent = family.errorMessage(err);
          }
        },
      }, pw, again, h('button', { type: 'submit', class: 'btn ghost' }, 'Change password'), status));
  }

  function backupCard() {
    const fileInput = h('input', { type: 'file', accept: 'application/json', class: 'hidden' });
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (!file) return;
      try {
        store.importData(await file.text());
        toast('Progress restored!', 'good');
        clear(main); parentPage();
      } catch (err) {
        toast(err.message, 'bad');
      }
    });
    return h('section', { class: 'card' },
      h('h2', {}, '💾 Backup'),
      h('p', { class: 'small muted' }, family.mode === 'cloud'
        ? 'Progress is saved online automatically. You can also download a copy.'
        : 'Progress is saved on this device after every answer. Download a backup to keep a copy or move it to another device.'),
      h('div', { class: 'controls left' },
        h('button', {
          type: 'button', class: 'btn ghost',
          onclick: () => {
            const blob = new Blob([store.exportData()], { type: 'application/json' });
            const a = h('a', { href: URL.createObjectURL(blob), download: `english-adventures-backup-${new Date().toISOString().slice(0, 10)}.json` });
            add(document.body, a);
            a.click();
            setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
          },
        }, '⬇ Download backup'),
        h('button', { type: 'button', class: 'btn ghost', onclick: () => fileInput.click() }, '⬆ Restore backup'),
        fileInput));
  }

  // ----------------------------------------------------- a child's progress
  function childProgressPage(id) {
    const child = store.state.profiles[id];
    if (!child) return go('#/parent');
    renderHeader(`${child.name}'s progress`);
    if (!ctx.isAdult()) return passwordGate(() => { clear(main); childProgressPage(id); });
    family.watchAllProgress();
    add(main, h('div', { class: 'child-head' }, img(child.avatar, { cls: 'avatar big' }), h('h2', {}, `📊 ${child.name}'s Progress Tracker`)));
    add(main, tracker(child));
  }

  // The Progress Tracker of the book, for one child.
  function tracker(child, { link = false } = {}) {
    const progress = child.progress || {};
    const s = P.summaryFor(child);
    const box = h('div');
    const table = h('table', { class: 'tracker' }, h('thead', {}, h('tr', {}, ['Week', 'Work', 'Done', 'Score', 'Stars'].map((t) => h('th', {}, t)))));
    const body = h('tbody');
    for (const unit of P.UNITS) {
      const u = s.units[unit.id] || { done: 0, total: P.unitActivities(unit).length, score: null, stars: 0 };
      add(body, h('tr', link ? { onclick: () => go(`#/unit/${unit.id}`) } : {},
        h('td', {}, unit.week ? String(unit.week) : ''),
        h('td', {}, `${unit.label}${unit.kind === 'chapter' ? `: ${unit.title}` : ''}`),
        h('td', {}, `${u.done} / ${u.total}`),
        h('td', {}, u.score ? `${fmt(u.score.earned)} / ${u.score.possible}` : '—'),
        h('td', {}, u.stars ? stars(u.stars) : '')));
    }
    add(table, body);
    add(box, h('div', { class: 'table-wrap' }, table));

    const rt = h('table', { class: 'tracker' }, h('thead', {}, h('tr', {}, ['Story', 'Words', 'Time', 'Mistakes', 'Times read'].map((t) => h('th', {}, t)))));
    const rb = h('tbody');
    for (const { act } of ctx.STORY_ACTS) {
      const r = s.reading[act.id];
      add(rb, h('tr', link ? { onclick: () => go(`#/act/${act.id}`) } : {},
        h('td', {}, act.storyTitle),
        h('td', {}, String(act.words || '')),
        h('td', {}, r ? formatTime(r.last.seconds) : ''),
        h('td', {}, r ? String(r.last.mistakes) : ''),
        h('td', {}, r ? String(r.count) : '')));
    }
    add(rt, rb);
    add(box, h('h2', { class: 'section-title' }, '📒 Reading records'),
      h('p', { class: 'muted' }, 'The stories get longer, but the reading gets faster!'),
      h('div', { class: 'table-wrap' }, rt));

    if (s.notYet.length) {
      add(box, h('h2', { class: 'section-title' }, '🤔 Things to practise more'),
        h('ul', { class: 'say-list' }, s.notYet.map((n) => h('li', {}, `${n.unit}: I can ${n.text} — `, h('em', {}, n.mark === 'almost' ? 'Almost' : 'Not yet')))));
    }
    const begin = P.UNITS.find((u) => u.id === 'begin');
    if (begin?.placement) add(box, placementBox(begin, progress));
    return box;
  }

  function placementBox(unit, progress) {
    const part = (key) => {
      const recs = P.unitActivities(unit).filter((a) => a.part === key).map((a) => progress[a.id]);
      if (!recs.every((r) => r?.completed)) return null;
      return recs.reduce((t, r) => t + (r.earned || 0), 0);
    };
    const scores = Object.fromEntries(['A', 'B', 'C', 'D', 'E', 'F'].map((k) => [k, part(k)]));
    return h('section', { class: 'review-box' }, h('h3', {}, "🧭 Let's Begin: where to start"),
      h('p', {}, ['A', 'B', 'C', 'D', 'E', 'F'].map((k) => `Part ${k}: ${scores[k] ?? '–'}`).join(' · ')),
      h('p', {}, unit.placement(scores) || 'Finish the Let’s Begin parts to get advice.'));
  }

  // ------------------------------------------------------------ scoreboard
  const CATEGORIES = [
    { key: 'stars', icon: '⭐', label: 'Stars', value: (s) => s.stars },
    { key: 'week', icon: '📅', label: 'Stars this week', value: (s) => s.starsThisWeek },
    { key: 'done', icon: '✅', label: 'Activities done', value: (s) => s.done },
    { key: 'units', icon: '📘', label: 'Units finished', value: (s) => s.unitsFinished },
    { key: 'review', icon: '📝', label: 'Review score', value: (s) => s.reviewPercent ?? 0, show: (s) => (s.reviewPercent == null ? '–' : `${s.reviewPercent}%`) },
    { key: 'reading', icon: '📒', label: 'Reading speed', value: (s) => s.bestWpm, show: (s) => (s.bestWpm ? `${s.bestWpm} words/min` : '–') },
    { key: 'words', icon: '🎤', label: 'Words said', value: (s) => s.wordsSaid },
  ];

  function scoreboardPage(sortKey = 'stars') {
    renderHeader('Scoreboard');
    if (family.mode === 'cloud') family.watchAllProgress();
    const cat = CATEGORIES.find((c) => c.key === sortKey) || CATEGORIES[0];
    const rows = children().map((child) => ({ child, s: P.summaryFor(child) }))
      .sort((a, b) => cat.value(b.s) - cat.value(a.s) || a.child.name.localeCompare(b.child.name));
    const me = store.state.currentProfileId;

    add(main, h('h2', { class: 'section-title' }, '🏆 Family scoreboard'));
    if (!rows.length) {
      add(main, h('p', { class: 'muted' }, 'No children yet.'));
      return;
    }

    const tabs = h('div', { class: 'score-tabs' }, CATEGORIES.map((c) => h('button', {
      type: 'button', class: `chip ${c.key === cat.key ? 'selected' : ''}`,
      onclick: () => { clear(main); scoreboardPage(c.key); },
    }, `${c.icon} ${c.label}`)));

    const podium = h('div', { class: 'podium' });
    const places = ['🥇', '🥈', '🥉'];
    [1, 0, 2].forEach((i) => {
      const row = rows[i];
      if (!row) return;
      add(podium, h('div', { class: `podium-place place-${i + 1} ${row.child.id === me ? 'me' : ''}` },
        h('span', { class: 'medal' }, places[i]),
        img(row.child.avatar, { cls: 'avatar big' }),
        h('strong', {}, row.child.name),
        h('span', {}, `${cat.icon} ${cat.show ? cat.show(row.s) : cat.value(row.s)}`),
        h('div', { class: 'podium-block' }, String(i + 1))));
    });

    const table = h('table', { class: 'tracker scoreboard' },
      h('thead', {}, h('tr', {}, h('th', {}, ''), h('th', {}, 'Name'), CATEGORIES.map((c) => h('th', { title: c.label }, c.icon)))));
    const body = h('tbody');
    const best = Object.fromEntries(CATEGORIES.map((c) => [c.key, Math.max(...rows.map((r) => c.value(r.s)))]));
    rows.forEach(({ child, s }, i) => {
      add(body, h('tr', { class: child.id === me ? 'me' : '' },
        h('td', {}, String(i + 1)),
        h('td', {}, h('span', { class: 'name-cell' }, img(child.avatar, { cls: 'avatar' }), child.name)),
        CATEGORIES.map((c) => h('td', { class: best[c.key] > 0 && c.value(s) === best[c.key] ? 'lead' : '' },
          `${c.show ? c.show(s) : c.value(s)}${best[c.key] > 0 && c.value(s) === best[c.key] && rows.length > 1 ? ' 👑' : ''}`))));
    });
    add(table, body);

    add(main, tabs, podium, h('div', { class: 'table-wrap' }, table),
      h('p', { class: 'small muted' }, CATEGORIES.map((c) => `${c.icon} ${c.label}`).join(' · ')),
      h('p', { class: 'small muted' }, family.mode === 'cloud'
        ? 'Scores update a few seconds after an exercise is finished on any device.'
        : 'Scores of the children who use this device.'));
  }

  function timeAgo(iso) {
    const mins = Math.round((Date.now() - Date.parse(iso)) / 60000);
    if (mins < 2) return 'just now';
    if (mins < 60) return `${mins} minutes ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.round(hours / 24);
    return days === 1 ? 'yesterday' : `${days} days ago`;
  }

  return { loadingPage, signInPage, pickerPage, parentPage, childProgressPage, scoreboardPage, tracker };
}
