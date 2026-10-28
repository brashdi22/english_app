// Pages for accounts and families: logging in, signing up, the parent area,
// a child's progress, the scoreboard, and "My family" in a child's settings.

import { h, add, clear, img, stars, toast, formatTime } from './ui.js';
import { BOOK } from './content/index.js';
import * as P from './progress.js';
import { validPin } from './accounts.js';
import { minutesText } from './screen-time.js';

// Children's PINs: 4 numbers on a shared device, 4–8 numbers for accounts.
const validAccountPin = (pin) => /^\d{4,8}$/.test(String(pin));

export function familyPages(ctx) {
  const { store, family, main, go, renderHeader, AVATARS, fmt } = ctx;
  const cloud = family.mode === 'cloud';
  const redraw = (fn) => () => { clear(main); fn(); };

  // ---------------------------------------------------------------- loading
  function loadingPage() {
    renderHeader();
    const slow = h('p', { class: 'muted', hidden: true }, 'This is taking a long time. Please check the internet connection.');
    const card = h('section', { class: 'card center' }, h('p', {}, '⏳ Getting ready…'), slow,
      h('div', { class: 'controls' },
        h('button', { type: 'button', class: 'btn small ghost', onclick: () => location.reload() }, 'Try again'),
        cloud && family.loggedIn() ? h('button', { type: 'button', class: 'btn small ghost', onclick: () => family.signOut() }, 'Log out') : null));
    card.querySelector('.controls').hidden = true;
    add(main, card);
    setTimeout(() => { slow.hidden = false; card.querySelector('.controls').hidden = false; }, 12000);
  }

  // Logged in, but the account's details are missing or could not be loaded.
  function accountProblemPage() {
    renderHeader();
    const status = formStatus();
    const logOut = h('button', { type: 'button', class: 'btn ghost', onclick: () => family.signOut() }, 'Log out');
    if (family.accountProblem === 'error') {
      add(main, h('section', { class: 'card center' },
        h('h2', {}, 'Your account could not be opened'),
        h('p', {}, family.problemMessage || 'Something went wrong.'),
        h('p', { class: 'muted' }, 'Please check the internet connection and try again.'),
        h('div', { class: 'controls' }, h('button', { type: 'button', class: 'btn primary', onclick: () => location.reload() }, 'Try again'), logOut)));
      return;
    }
    const kid = family.isKidLogin();
    const fix = h('button', {
      type: 'button', class: 'btn primary',
      onclick: async () => {
        fix.disabled = true;
        status.textContent = 'Setting up…';
        try {
          await family.finishAccount();
        } catch (err) {
          status.textContent = family.errorMessage(err);
          fix.disabled = false;
        }
      },
    }, kid ? 'Finish my account' : 'Make it a parent account');
    add(main, h('section', { class: 'card center' },
      h('h2', {}, kid ? 'Your account is not finished' : 'This account needs setting up'),
      h('p', {}, kid
        ? `The account "${family.loginName()}" was not finished when it was made. Tap below to finish it.`
        : `${family.loginName()} was made with an older version of the app. Make it a parent account to get a family ID, or log out.`),
      h('div', { class: 'controls' }, fix, logOut), status));
  }

  // ---------------------------------------------------- shared form helpers
  function field(attrs) {
    return h('input', { class: 'write-input', autocomplete: 'off', ...attrs });
  }

  function formStatus() {
    return h('p', { class: 'form-status', role: 'status', 'aria-live': 'polite' });
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

  // A number pad. Calls onPin(pin) → true when the PIN is right.
  function pinPad({ title, avatar, min = 4, max = 4, onPin, onCancel }) {
    let pin = '';
    const dots = h('div', { class: 'pin-dots', 'aria-label': 'PIN' });
    const msg = h('p', { class: 'pin-msg', role: 'status', 'aria-live': 'polite' }, 'Type your PIN');
    const okBtn = min !== max ? h('button', { type: 'button', class: 'pin-key ok', 'aria-label': 'OK', onclick: () => submit() }, '✓') : null;
    const draw = () => {
      clear(dots);
      const shown = Math.max(min, pin.length);
      for (let i = 0; i < shown; i++) add(dots, h('span', { class: `pin-dot ${i < pin.length ? 'on' : ''}` }));
      if (okBtn) okBtn.disabled = pin.length < min;
    };
    let busy = false;
    async function submit() {
      if (busy || pin.length < min) return;
      busy = true;
      msg.textContent = 'Checking…';
      let ok = false;
      try {
        ok = await onPin(pin);
      } catch (err) {
        msg.textContent = err.message;
        busy = false;
        pin = '';
        draw();
        return;
      }
      busy = false;
      if (ok) {
        dialog.close();
        return;
      }
      const box = dialog.querySelector('.pin-box');
      box.classList.remove('shake');
      void box.offsetWidth;
      box.classList.add('shake');
      msg.textContent = "That's not your PIN. Try again!";
      pin = '';
      draw();
    }
    const press = (key) => {
      if (busy) return;
      if (key === 'del') pin = pin.slice(0, -1);
      else if (pin.length < max) pin += key;
      draw();
      if (pin.length === max) submit();
    };
    const keys = h('div', { class: 'pin-keys' },
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0'].map((k) => h('button', {
        type: 'button', class: 'pin-key', 'aria-label': k === 'del' ? 'Delete' : k, onclick: () => press(k),
      }, k === 'del' ? '⌫' : k)), okBtn);
    const dialog = h('dialog', { class: 'modal pin-modal' },
      h('div', { class: 'pin-box' }, avatar ? img(avatar, { cls: 'avatar big' }) : null, h('h2', {}, title), msg, dots, keys,
        h('button', { type: 'button', class: 'btn ghost', onclick: () => { dialog.close(); onCancel?.(); } }, 'Cancel')));
    dialog.addEventListener('keydown', (e) => {
      if (/^\d$/.test(e.key)) press(e.key);
      if (e.key === 'Backspace') press('del');
      if (e.key === 'Enter') submit();
    });
    dialog.addEventListener('close', () => dialog.remove());
    add(document.body, dialog);
    draw();
    dialog.showModal();
  }

  // ================================================================ ACCOUNTS
  // Welcome: children and parents log in or create an account.
  function welcomePage(tab = 'kid') {
    renderHeader();
    const tabs = h('div', { class: 'tabs who-tabs' },
      h('button', { type: 'button', class: `tab ${tab.startsWith('kid') ? 'on' : ''}`, onclick: () => { clear(main); welcomePage('kid'); } }, '🧒 I’m a child'),
      h('button', { type: 'button', class: `tab ${tab.startsWith('parent') ? 'on' : ''}`, onclick: () => { clear(main); welcomePage('parent'); } }, '👪 I’m a parent'));
    if (family.notice) add(main, h('p', { class: 'card notice warn', role: 'status' }, family.notice));
    add(main,
      h('section', { class: 'hero small' }, img('cover', { cls: 'cover', alt: '' }),
        h('div', { class: 'hero-text' }, h('h2', {}, BOOK.title), h('p', {}, BOOK.subtitle))),
      tabs);
    if (tab === 'kid') kidLogin();
    else if (tab === 'kid-new') kidSignUp();
    else if (tab === 'parent') parentLogin();
    else parentSignUp();
  }

  function kidLogin() {
    const recent = family.recentKids();
    if (recent.length) {
      const grid = h('div', { class: 'profile-list' });
      for (const k of recent) {
        add(grid, h('div', { class: 'profile' },
          h('button', {
            type: 'button', class: 'profile-pick',
            onclick: () => pinPad({
              title: k.username, avatar: k.avatar || 'sam', min: 4, max: 8,
              onPin: async (pin) => {
                try {
                  await family.signInKid(k.username, pin);
                  return true;
                } catch (err) {
                  if (/invalid-credential|wrong-password|user-not-found/.test(err.code || '')) return false;
                  throw new Error(family.errorMessage(err, { kid: true }));
                }
              },
            }),
          }, img(k.avatar || 'sam', { cls: 'avatar big' }), h('span', {}, k.username)),
          h('button', {
            type: 'button', class: 'icon-btn small-x', 'aria-label': `Remove ${k.username} from this device`, title: 'Remove from this device',
            onclick: () => { family.forgetKid(k.username); clear(main); welcomePage('kid'); },
          }, '✕')));
      }
      add(main, h('section', { class: 'card' }, h('h2', {}, '👋 Tap your picture'), grid));
    }

    const username = field({ type: 'text', placeholder: 'Username', 'aria-label': 'Username', autocapitalize: 'none', autocomplete: 'username' });
    const pin = field({ type: 'password', inputmode: 'numeric', placeholder: 'PIN', 'aria-label': 'PIN', autocomplete: 'current-password', maxlength: '8' });
    const status = formStatus();
    const submit = h('button', { type: 'submit', class: 'btn primary big' }, 'Log in');
    add(main, h('section', { class: 'card' },
      h('h2', {}, recent.length ? 'Someone else?' : '🧒 Log in'),
      h('form', {
        class: 'auth-form',
        onsubmit: async (e) => {
          e.preventDefault();
          status.textContent = '';
          submit.disabled = true;
          try {
            await family.signInKid(username.value, pin.value);
          } catch (err) {
            status.textContent = family.errorMessage(err, { kid: true });
            submit.disabled = false;
          }
        },
      }, username, pin, submit, status),
      h('p', {}, 'New here? ', h('button', { type: 'button', class: 'btn small primary', onclick: () => { clear(main); welcomePage('kid-new'); } }, 'Create my account'))));
    if (!recent.length) username.focus();
  }

  function kidSignUp() {
    let avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    const username = field({ type: 'text', placeholder: 'Choose a username', 'aria-label': 'Username', autocapitalize: 'none', maxlength: '20' });
    const pin = field({ type: 'password', inputmode: 'numeric', placeholder: 'Choose a PIN (4–8 numbers)', 'aria-label': 'PIN', maxlength: '8', autocomplete: 'new-password' });
    const again = field({ type: 'password', inputmode: 'numeric', placeholder: 'PIN again', 'aria-label': 'PIN again', maxlength: '8', autocomplete: 'new-password' });
    const code = field({ type: 'text', placeholder: 'Family ID (optional)', 'aria-label': 'Family ID', autocapitalize: 'characters', maxlength: '12' });
    const status = formStatus();
    const submit = h('button', { type: 'submit', class: 'btn primary big' }, 'Create my account');
    add(main, h('section', { class: 'card' },
      h('h2', {}, '🧒 Create my account'),
      h('form', {
        class: 'auth-form',
        onsubmit: async (e) => {
          e.preventDefault();
          status.textContent = '';
          if (!family.validUsername(username.value)) { status.textContent = 'Usernames have 3–20 letters or numbers (you can also use . - _).'; return; }
          if (!validAccountPin(pin.value)) { status.textContent = 'Your PIN must be 4 to 8 numbers.'; return; }
          if (pin.value !== again.value) { status.textContent = 'The two PINs are not the same.'; return; }
          submit.disabled = true;
          status.textContent = 'Creating your account…';
          try {
            const { joinError } = await family.signUpKid({ username: username.value, pin: pin.value, avatar, code: code.value.trim() });
            ctx.speak(`Welcome, ${username.value.trim()}!`);
            if (joinError) toast(`Your account is ready, but: ${joinError} You can join later in Settings.`, 'bad');
            else if (code.value.trim()) toast('Your account is ready! Your parent needs to accept you into the family.', 'good');
          } catch (err) {
            status.textContent = family.errorMessage(err, { kid: true });
            submit.disabled = false;
          }
        },
      },
      h('label', { class: 'field-label' }, 'Username (you will use it to log in)'), username,
      h('label', { class: 'field-label' }, 'My picture'), avatarPicker(avatar, (a) => { avatar = a; }),
      h('label', { class: 'field-label' }, 'My secret PIN'), pin, again,
      h('label', { class: 'field-label' }, 'Family ID'), code,
      h('p', { class: 'small muted' }, 'Ask your parent for the family ID, so they can see your progress. You can also join a family later in ⚙️ Settings.'),
      submit, status),
      h('p', {}, 'Already have an account? ', h('button', { type: 'button', class: 'btn small ghost', onclick: () => { clear(main); welcomePage('kid'); } }, 'Log in'))));
    username.focus();
  }

  function parentLogin() {
    const email = field({ type: 'email', placeholder: 'Email', 'aria-label': 'Email', autocomplete: 'username' });
    const password = field({ type: 'password', placeholder: 'Password', 'aria-label': 'Password', autocomplete: 'current-password' });
    const status = formStatus();
    const submit = h('button', { type: 'submit', class: 'btn primary big' }, 'Log in');
    add(main, h('section', { class: 'card' },
      h('h2', {}, '👪 Parent log in'),
      h('form', {
        class: 'auth-form',
        onsubmit: async (e) => {
          e.preventDefault();
          submit.disabled = true;
          status.textContent = '';
          try {
            await family.signInParent(email.value, password.value);
          } catch (err) {
            status.textContent = family.errorMessage(err);
            submit.disabled = false;
          }
        },
      }, email, password, submit, status),
      h('button', {
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
      }, 'Forgot password?'),
      h('p', {}, 'No parent account yet? ', h('button', { type: 'button', class: 'btn small primary', onclick: () => { clear(main); welcomePage('parent-new'); } }, 'Create a parent account'))));
  }

  function parentSignUp() {
    const email = field({ type: 'email', placeholder: 'Email', 'aria-label': 'Email', autocomplete: 'username' });
    const password = field({ type: 'password', placeholder: 'Password (6+ characters)', 'aria-label': 'Password', autocomplete: 'new-password' });
    const again = field({ type: 'password', placeholder: 'Password again', 'aria-label': 'Password again', autocomplete: 'new-password' });
    const status = formStatus();
    const submit = h('button', { type: 'submit', class: 'btn primary big' }, 'Create parent account');
    add(main, h('section', { class: 'card' },
      h('h2', {}, '👪 Create a parent account'),
      h('p', { class: 'small muted' }, 'You will get a family ID. Your children type it in their account to ask to join your family; you accept them, then you can see their progress.'),
      h('form', {
        class: 'auth-form',
        onsubmit: async (e) => {
          e.preventDefault();
          if (password.value !== again.value) { status.textContent = 'The two passwords are not the same.'; return; }
          submit.disabled = true;
          status.textContent = 'Creating your account…';
          try {
            await family.signUpParent(email.value, password.value);
          } catch (err) {
            status.textContent = family.errorMessage(err);
            submit.disabled = false;
          }
        },
      }, email, password, again, submit, status),
      h('p', {}, 'Already have an account? ', h('button', { type: 'button', class: 'btn small ghost', onclick: () => { clear(main); welcomePage('parent'); } }, 'Log in'))));
    email.focus();
  }

  // ------------------------------------------- "My family" (child settings)
  function kidFamilyCard() {
    const card = h('section', { class: 'card settings' }, h('h2', {}, '👪 My family'));
    const state = family.membership();
    const code = family.familyCode();
    if (state === 'member') {
      add(card, h('p', {}, '✓ You are in the family ', h('strong', { class: 'family-code small-code' }, code), '. Your parent can see your progress, and you are on the family scoreboard.'),
        h('p', { class: 'small muted' }, 'Only your parent can take you out of the family.'));
      return card;
    }
    if (state === 'pending') {
      add(card, h('p', {}, '⏳ You asked to join the family ', h('strong', { class: 'family-code small-code' }, code), '. Your parent needs to accept you.'),
        h('button', { type: 'button', class: 'btn ghost', onclick: async () => { await family.cancelJoin(); toast('Request cancelled.', 'good'); } }, 'Cancel the request'));
      return card;
    }
    if (state === 'rejected') add(card, h('p', { class: 'warn' }, `Your request to join ${code} was not accepted. Check the family ID with your parent.`));
    if (state === 'removed') add(card, h('p', { class: 'warn' }, 'You are not in a family any more.'));
    if (state === 'none') add(card, h('p', {}, 'Join your family so your parent can see your progress and you can play on the family scoreboard.'));
    const input = field({ type: 'text', placeholder: 'Family ID', 'aria-label': 'Family ID', autocapitalize: 'characters', maxlength: '12' });
    const status = formStatus();
    add(card, h('form', {
      class: 'auth-form',
      onsubmit: async (e) => {
        e.preventDefault();
        if (!input.value.trim()) { status.textContent = 'Type the family ID your parent gave you.'; return; }
        status.textContent = 'Sending…';
        try {
          await family.joinFamily(input.value);
          toast('Request sent! Your parent needs to accept you.', 'good');
        } catch (err) {
          status.textContent = err.code ? family.errorMessage(err) : err.message;
        }
      },
    }, input, h('button', { type: 'submit', class: 'btn primary' }, 'Ask to join'), status));
    return card;
  }

  function kidPictureCard() {
    const p = store.profile();
    return h('section', { class: 'card settings' }, h('h2', {}, `🙂 ${p.name}`),
      h('p', { class: 'small muted' }, 'My picture:'),
      avatarPicker(p.avatar, (a) => store.updateProfile(p.id, (prof) => { prof.avatar = a; })));
  }

  // ================================================================ PARENT
  function parentDashboard() {
    renderHeader('Parent area');
    const code = family.familyCode();
    add(main,
      h('section', { class: 'card family-id-card' },
        h('h2', {}, '👪 My family'),
        h('p', {}, 'Family ID:'),
        h('div', { class: 'family-code' }, code || '…'),
        h('div', { class: 'controls left' },
          h('button', {
            type: 'button', class: 'btn small ghost',
            onclick: async () => {
              try { await navigator.clipboard.writeText(code); toast('Family ID copied.', 'good'); } catch { toast(code); }
            },
          }, '📋 Copy')),
        h('p', { class: 'small muted' }, 'Your children type this family ID when they create their account, or later in ⚙️ Settings → My family. You then accept them here.'),
        h('p', { class: 'small muted' }, `Logged in as ${family.account?.email || ''}`)));

    const requests = family.requests;
    const reqCard = h('section', { class: 'card' }, h('h2', {}, `📨 Join requests${requests.length ? ` (${requests.length})` : ''}`));
    if (!requests.length) add(reqCard, h('p', { class: 'muted' }, 'No requests right now.'));
    for (const r of requests) {
      add(reqCard, h('div', { class: 'request-row' },
        img(r.avatar || 'sam', { cls: 'avatar' }),
        h('div', { class: 'request-name' }, h('strong', {}, r.username), h('span', { class: 'small muted' }, r.createdAt ? ` asked ${timeAgo(r.createdAt)}` : '')),
        h('button', { type: 'button', class: 'btn small good', onclick: async () => { await family.acceptRequest(r.uid); toast(`${r.username} joined the family.`, 'good'); } }, '✓ Accept'),
        h('button', { type: 'button', class: 'btn small ghost', onclick: async () => { await family.rejectRequest(r.uid); toast(`Request from ${r.username} rejected.`); } }, '✗ Reject')));
    }

    const kids = family.children();
    const list = h('div', { class: 'child-cards' });
    for (const child of kids) add(list, childCard(child));
    add(main, reqCard,
      h('section', { class: 'card' }, h('h2', {}, '🧒 Children'),
        kids.length ? list : h('p', { class: 'muted' }, 'No children yet. Share the family ID with them.')),
      passwordCard(),
      h('div', { class: 'controls' },
        h('button', { type: 'button', class: 'btn ghost', onclick: () => go('#/scoreboard') }, '🏆 Scoreboard'),
        h('button', { type: 'button', class: 'btn ghost', onclick: async () => { await family.signOut(); go('#/'); } }, '🚪 Log out')),
      deleteParentCard());
  }

  function deleteParentCard() {
    const pw = field({ type: 'password', placeholder: 'Your log-in password', autocomplete: 'current-password', 'aria-label': 'Your log-in password' });
    const withKids = h('input', { type: 'checkbox', 'aria-label': 'Also delete the children’s accounts' });
    const status = formStatus();
    const button = h('button', { type: 'submit', class: 'btn danger' }, '🗑 Delete my account');
    return h('details', { class: 'card danger-zone' },
      h('summary', {}, 'Delete my parent account'),
      h('p', { class: 'small' }, 'This deletes your parent account and your family. The children keep their own accounts unless you tick the box below. This cannot be undone.'),
      h('form', {
        class: 'auth-form',
        onsubmit: async (e) => {
          e.preventDefault();
          if (!pw.value) { status.textContent = 'Type your log-in password to confirm.'; return; }
          const what = withKids.checked ? 'your account, your family and all the children’s accounts' : 'your account and your family';
          if (!confirm(`Delete ${what}? This cannot be undone.`)) return;
          button.disabled = true;
          status.textContent = 'Deleting…';
          try {
            await family.deleteParentAccount(pw.value, { deleteChildren: withKids.checked });
          } catch (err) {
            status.textContent = family.errorMessage(err);
            button.disabled = false;
          }
        },
      }, pw, h('label', { class: 'tick-row' }, withKids, ' Also delete the children’s accounts and all their work'), button, status));
  }

  // =============================================== THIS-DEVICE (no accounts)
  function pickerPage() {
    renderHeader('Who is learning?');
    const kids = family.children();
    const grid = h('div', { class: 'profile-list' });
    for (const child of kids) {
      add(grid, h('button', { type: 'button', class: 'profile-pick', onclick: () => childLogin(child) },
        img(child.avatar, { cls: 'avatar big' }), h('span', {}, child.name)));
    }
    if (family.notice) add(main, h('p', { class: 'card notice warn', role: 'status' }, family.notice));
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
    pinPad({
      title: child.name, avatar: child.avatar,
      onPin: async (pin) => {
        const ok = await family.loginChild(child.id, pin);
        if (ok) {
          ctx.speak(`Hello, ${child.name}!`);
          go('#/');
        }
        return ok;
      },
    });
  }

  function passwordGate(onOpen) {
    const input = field({ type: 'password', placeholder: 'Parent password', autocomplete: 'current-password', 'aria-label': 'Parent password' });
    const status = formStatus();
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

  function localParentPage() {
    renderHeader('Parent area');
    if (!ctx.isAdult()) return passwordGate(redraw(localParentPage));
    const kids = family.children();
    const list = h('div', { class: 'child-cards' });
    for (const child of kids) add(list, childCard(child));
    add(main,
      h('section', { class: 'card' }, h('h2', {}, '👪 Family'),
        h('p', {}, 'Children and progress are saved on this device only. To let the children use several devices with their own accounts, set up accounts (see "Accounts" in the README).')),
      h('section', { class: 'card' }, h('h2', {}, '🧒 Children'), kids.length ? list : h('p', { class: 'muted' }, 'No children yet. Add them below.')),
      addChildCard(), passwordCard(), backupCard(),
      h('div', { class: 'controls' },
        h('button', { type: 'button', class: 'btn ghost', onclick: () => go('#/scoreboard') }, '🏆 Scoreboard'),
        h('button', { type: 'button', class: 'btn primary', onclick: () => { ctx.setAdult(false); go('#/'); } }, 'Close the parent area')));
  }

  function parentPage() {
    if (cloud) return parentDashboard();
    return localParentPage();
  }

  function childCard(child) {
    const s = P.summaryFor(child);
    const current = Object.entries(s.units).find(([, u]) => u.done < u.total);
    const unitLabel = current ? P.UNITS.find((u) => u.id === current[0])?.label : 'All done!';
    const actions = cloud
      ? [
        h('button', { type: 'button', class: 'btn small primary', onclick: () => go(`#/parent/child/${child.id}`) }, '📊 Progress'),
        h('button', { type: 'button', class: 'btn small ghost', onclick: () => timeDialog(child) }, '⏱ Time'),
        h('button', {
          type: 'button', class: 'btn small danger',
          onclick: async () => {
            if (!confirm(`Remove ${child.name} from the family? Their account and progress stay theirs; you just won't see them any more.`)) return;
            await family.removeMember(child.id);
          },
        }, 'Remove from family'),
        h('button', {
          type: 'button', class: 'btn small danger',
          onclick: async () => {
            if (!confirm(`Delete ${child.name}'s account? All of ${child.name}'s work is deleted and the account cannot be used any more. This cannot be undone.`)) return;
            try {
              await family.deleteChildAccount(child.id);
              toast(`${child.name}'s account was deleted.`, 'good');
            } catch (err) {
              toast(family.errorMessage(err), 'bad');
            }
          },
        }, '🗑 Delete account'),
      ]
      : [
        h('button', { type: 'button', class: 'btn small primary', onclick: () => go(`#/parent/child/${child.id}`) }, '📊 Progress'),
        h('button', { type: 'button', class: 'btn small ghost', onclick: () => editChild(child) }, '✏️ Edit'),
        h('button', { type: 'button', class: 'btn small ghost', onclick: () => setPinDialog(child) }, '🔢 PIN'),
        h('button', {
          type: 'button', class: 'btn small ghost',
          onclick: () => {
            if (!confirm(`Start ${child.name}'s book again? All progress and scores will be deleted.`)) return;
            store.resetProgress(child.id);
            toast('Progress reset.', 'good');
            redraw(localParentPage)();
          },
        }, '🔁 Reset'),
        h('button', {
          type: 'button', class: 'btn small danger',
          onclick: () => {
            if (!confirm(`Remove ${child.name} and all their progress? This cannot be undone.`)) return;
            store.deleteProfile(child.id);
            redraw(localParentPage)();
          },
        }, '🗑 Remove'),
      ];
    return h('div', { class: 'child-card' },
      h('div', { class: 'child-head' }, img(child.avatar || 'sam', { cls: 'avatar big' }),
        h('div', {}, h('h3', {}, child.name),
          h('p', { class: 'small muted' }, s.lastActive ? `Last practised ${timeAgo(s.lastActive)}` : 'Not started yet'))),
      h('div', { class: 'stat-row' },
        stat('⭐', s.stars, 'stars'),
        stat('✅', `${s.done}/${s.total}`, 'activities'),
        stat('📝', s.reviewPercent == null ? '–' : `${s.reviewPercent}%`, 'reviews'),
        stat('📖', unitLabel, 'working on')),
      cloud ? timeLine(child) : null,
      h('div', { class: 'controls left' }, actions));
  }

  // ------------------------------------------------------------ screen time
  function timeLine(child) {
    const t = family.childTime(child.id);
    const used = `${Math.floor(t.usedSeconds / 60)} min`;
    if (!t.limit) return h('p', { class: 'time-line small' }, `⏱ Today: ${used} · no daily limit`);
    const total = t.limit + t.extraMinutes;
    const left = Math.max(0, total * 60 - t.usedSeconds);
    return h('p', { class: `time-line small ${left ? '' : 'up'}` },
      `⏱ Today: ${used} of ${t.limit} min`, t.extraMinutes ? ` + ${t.extraMinutes} extra` : '',
      left ? ` · ${Math.ceil(left / 60)} min left` : ' · time is up');
  }

  const minutesField = (label, value = '') => field({
    type: 'number', inputmode: 'numeric', min: '1', max: '600', step: '1', value: String(value), 'aria-label': label, placeholder: 'minutes', class: 'write-input minutes-input',
  });
  const readMinutes = (input) => {
    const n = Number(input.value);
    return Number.isInteger(n) && n >= 1 && n <= 600 ? n : null;
  };

  function timeDialog(child) {
    const t = family.childTime(child.id);
    const limitInput = minutesField('Daily limit in minutes', t.limit || 60);
    const noLimit = h('input', { type: 'checkbox', 'aria-label': 'No daily limit', checked: !t.limit });
    limitInput.disabled = !t.limit;
    noLimit.addEventListener('change', () => { limitInput.disabled = noLimit.checked; });
    const addInput = minutesField('Minutes to add today');
    const status = formStatus();
    const done = (msg) => { toast(msg, 'good'); dialog.close(); };
    const dialog = h('dialog', { class: 'modal time-modal' },
      h('h2', {}, `⏱ ${child.name}'s time`),
      timeLine(child),
      h('form', {
        class: 'auth-form', novalidate: true,
        onsubmit: async (e) => {
          e.preventDefault();
          const minutes = noLimit.checked ? 0 : readMinutes(limitInput);
          if (minutes == null) { status.textContent = 'Please type a number of minutes from 1 to 600.'; return; }
          try {
            await family.setDailyLimit(child.id, minutes);
            done(minutes ? `${child.name}'s daily limit is now ${minutes} minutes.` : `${child.name} has no daily limit now.`);
          } catch (err) { status.textContent = family.errorMessage(err); }
        },
      }, h('h3', {}, 'Daily limit'),
      h('div', { class: 'minutes-row' }, limitInput, h('span', {}, 'minutes a day')),
      h('label', { class: 'tick-row' }, noLimit, ' No limit'),
      h('button', { type: 'submit', class: 'btn primary' }, 'Save limit')),
      h('form', {
        class: 'auth-form', novalidate: true,
        onsubmit: async (e) => {
          e.preventDefault();
          const minutes = readMinutes(addInput);
          if (minutes == null) { status.textContent = 'Please type a number of minutes from 1 to 600.'; return; }
          try {
            await family.addTimeFor(child.id, minutes);
            done(`Added ${minutesText(minutes * 60)} for ${child.name} today.`);
          } catch (err) { status.textContent = family.errorMessage(err); }
        },
      }, h('h3', {}, 'Extra time today'),
      h('div', { class: 'minutes-row' }, addInput, h('span', {}, 'minutes')),
      h('button', { type: 'submit', class: 'btn good' }, '➕ Add time')),
      status,
      h('div', { class: 'controls' }, h('button', { type: 'button', class: 'btn ghost', onclick: () => dialog.close() }, 'Close')));
    dialog.addEventListener('close', () => dialog.remove());
    add(document.body, dialog);
    dialog.showModal();
  }

  // A child's time is used up for today.
  function timeUpPage() {
    renderHeader();
    const p = store.profile();
    const t = family.screenTime();
    add(main, h('section', { class: 'card center time-up' },
      img(p?.avatar || 'sam', { cls: 'avatar big' }),
      h('h2', {}, '⏰ Time’s up for today!'),
      h('p', {}, `You used your ${minutesText((t.limitMinutes + t.extraMinutes) * 60)} today. Well done, ${p?.name || ''}! See you tomorrow.`),
      h('p', { class: 'small muted' }, 'Your work is saved. Your parent can give you more time.'),
      h('button', { type: 'button', class: 'btn ghost', onclick: grownUpAddTime }, '👪 Grown-up: add time')));
  }

  function grownUpAddTime() {
    const pw = field({ type: 'password', autocomplete: 'current-password', 'aria-label': 'Parent password', placeholder: 'Parent password' });
    const minutes = minutesField('Minutes to add today', 15);
    const status = formStatus();
    const dialog = h('dialog', { class: 'modal' },
      h('h2', {}, '👪 Add time for today'),
      h('form', {
        class: 'auth-form', novalidate: true,
        onsubmit: async (e) => {
          e.preventDefault();
          const n = readMinutes(minutes);
          if (n == null) { status.textContent = 'Please type a number of minutes from 1 to 600.'; return; }
          if (!(await family.checkParent(pw.value))) { pw.value = ''; status.textContent = 'That password is not right.'; pw.focus(); return; }
          try {
            await family.addMyTime(n);
            dialog.close();
            toast(`${minutesText(n * 60)} added.`, 'good');
          } catch (err) { status.textContent = family.errorMessage(err); }
        },
      }, pw, h('div', { class: 'minutes-row' }, minutes, h('span', {}, 'minutes')), status,
      h('div', { class: 'controls' },
        h('button', { type: 'button', class: 'btn ghost', onclick: () => dialog.close() }, 'Cancel'),
        h('button', { type: 'submit', class: 'btn primary' }, 'Add time'))));
    dialog.addEventListener('close', () => dialog.remove());
    add(document.body, dialog);
    dialog.showModal();
    pw.focus();
  }

  function stat(icon, value, label) {
    return h('div', { class: 'stat' }, h('span', { class: 'stat-icon' }, icon), h('strong', {}, String(value)), h('span', { class: 'small muted' }, label));
  }

  function addChildCard() {
    let avatar = AVATARS[family.children().length % AVATARS.length];
    const name = field({ type: 'text', placeholder: "Child's name", maxlength: '30', 'aria-label': "Child's name" });
    const pin = field({ type: 'text', inputmode: 'numeric', class: 'write-input pin-input', placeholder: '4-digit PIN', maxlength: '4', 'aria-label': 'PIN' });
    const status = formStatus();
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
          redraw(localParentPage)();
        },
      }, name, h('p', { class: 'small' }, 'Picture:'), avatarPicker(avatar, (a) => { avatar = a; }),
      h('p', { class: 'small' }, 'PIN (the child types it to log in):'), pin,
      h('button', { type: 'submit', class: 'btn primary' }, 'Add child'), status));
  }

  function editChild(child) {
    let avatar = child.avatar;
    const name = field({ type: 'text', value: child.name, maxlength: '30', 'aria-label': 'Name' });
    const dialog = h('dialog', { class: 'modal' },
      h('h2', {}, `✏️ ${child.name}`), name, avatarPicker(avatar, (a) => { avatar = a; }),
      h('div', { class: 'controls' },
        h('button', { type: 'button', class: 'btn ghost', onclick: () => dialog.close() }, 'Cancel'),
        h('button', {
          type: 'button', class: 'btn primary',
          onclick: () => {
            store.updateProfile(child.id, (p) => { p.name = name.value.trim() || p.name; p.avatar = avatar; });
            dialog.close();
            redraw(localParentPage)();
          },
        }, 'Save')));
    dialog.addEventListener('close', () => dialog.remove());
    add(document.body, dialog);
    dialog.showModal();
  }

  function setPinDialog(child) {
    const pin = field({ type: 'text', inputmode: 'numeric', class: 'write-input pin-input', placeholder: 'New 4-digit PIN', maxlength: '4', 'aria-label': 'New PIN' });
    const status = formStatus();
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
    const pw = field({ type: 'password', placeholder: 'New parent password', autocomplete: 'new-password', 'aria-label': 'New parent password' });
    const again = field({ type: 'password', placeholder: 'New password again', autocomplete: 'new-password', 'aria-label': 'New password again' });
    const status = formStatus();
    return h('section', { class: 'card' },
      h('h2', {}, '🔑 Grown-up password'),
      h('p', { class: 'small muted' }, cloud
        ? 'Children’s devices ask for this password before a grown-up gives points (writing, talking, letter sounds). Children in your family use your password; it starts as the one in the instructions.'
        : 'This password opens the parent area and grown-up scoring.'),
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
            status.textContent = '✓ The password was changed.';
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
        redraw(localParentPage)();
      } catch (err) {
        toast(err.message, 'bad');
      }
    });
    return h('section', { class: 'card' },
      h('h2', {}, '💾 Backup'),
      h('p', { class: 'small muted' }, 'Progress is saved on this device after every answer. Download a backup to keep a copy or move it to another device.'),
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

  // ======================================================= a child's progress
  function childProgressPage(id) {
    const child = store.state.profiles[id];
    if (!child) return go('#/parent');
    renderHeader(`${child.name}'s progress`);
    if (!cloud && !ctx.isAdult()) return passwordGate(redraw(() => childProgressPage(id)));
    if (cloud) family.watchProgress(id);
    add(main, h('div', { class: 'child-head' }, img(child.avatar || 'sam', { cls: 'avatar big' }), h('h2', {}, `📊 ${child.name}'s Progress Tracker`)));
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

  // ============================================================ scoreboard
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
    const cat = CATEGORIES.find((c) => c.key === sortKey) || CATEGORIES[0];
    const rows = family.scoreboard()
      .sort((a, b) => cat.value(b.summary) - cat.value(a.summary) || a.name.localeCompare(b.name));

    add(main, h('h2', { class: 'section-title' }, '🏆 Family scoreboard'));
    if (cloud && family.role() === 'kid' && family.membership() !== 'member') {
      add(main, h('p', { class: 'note' }, 'Join your family in ⚙️ Settings to compare your scores with your brothers, sisters and cousins!'));
    }
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
      add(podium, h('div', { class: `podium-place place-${i + 1} ${row.me ? 'me' : ''}` },
        h('span', { class: 'medal' }, places[i]),
        img(row.avatar || 'sam', { cls: 'avatar big' }),
        h('strong', {}, row.name),
        h('span', {}, `${cat.icon} ${cat.show ? cat.show(row.summary) : cat.value(row.summary)}`),
        h('div', { class: 'podium-block' }, String(i + 1))));
    });

    const table = h('table', { class: 'tracker scoreboard' },
      h('thead', {}, h('tr', {}, h('th', {}, ''), h('th', {}, 'Name'), CATEGORIES.map((c) => h('th', { title: c.label }, c.icon)))));
    const body = h('tbody');
    const best = Object.fromEntries(CATEGORIES.map((c) => [c.key, Math.max(...rows.map((r) => c.value(r.summary)))]));
    rows.forEach(({ name, avatar, summary, me }, i) => {
      add(body, h('tr', { class: me ? 'me' : '' },
        h('td', {}, String(i + 1)),
        h('td', {}, h('span', { class: 'name-cell' }, img(avatar || 'sam', { cls: 'avatar' }), name)),
        CATEGORIES.map((c) => {
          const leads = best[c.key] > 0 && c.value(summary) === best[c.key];
          return h('td', { class: leads ? 'lead' : '' }, `${c.show ? c.show(summary) : c.value(summary)}${leads && rows.length > 1 ? ' 👑' : ''}`);
        })));
    });
    add(table, body);

    add(main, tabs, podium, h('div', { class: 'table-wrap' }, table),
      h('p', { class: 'small muted' }, CATEGORIES.map((c) => `${c.icon} ${c.label}`).join(' · ')),
      h('p', { class: 'small muted' }, cloud
        ? 'Scores update a few seconds after an exercise is finished, on any device.'
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

  return {
    loadingPage, accountProblemPage, timeUpPage, welcomePage, pickerPage, parentPage, childProgressPage, scoreboardPage, tracker,
    kidFamilyCard, kidPictureCard,
  };
}
